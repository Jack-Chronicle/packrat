import { App, Notice, Plugin, TFile } from "obsidian";
import { PackratSettings, DEFAULT_SETTINGS } from "./settingsData";
import { PackratSettingTab } from "./settingsTab";

export default class PackratPlugin extends Plugin {
	settings: PackratSettings;

	async onload() {
		console.log("Packrat: Loading...");

		await this.loadSettings();

		this.addSettingTab(new PackratSettingTab(this.app, this));

		this.addCommand({
			id: "run",
			name: "Process completed recurring Tasks within the active note",
			checkCallback: (checking: boolean) => {
				const activeFile = this.app.workspace.getActiveFile();
				if (activeFile && activeFile.extension === "md") {
					if (checking) return true;
					this.processCompletedRecurringTasks(activeFile);
					return true;
				}
				return false;
			},
		});
	}

	onunload() {
		console.log("Packrat: Unloading...");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	getStyledTrigger(trigger: string): string {
		const style = (this.settings.trigger_comment_style?.includes("{trigger}") 
			? this.settings.trigger_comment_style 
			: "%% {trigger} %%");
		return style.replace("{trigger}", trigger);
	}

	async processCompletedRecurringTasks(activeFile: TFile): Promise<void> {
		try {
			const { vault } = this.app;
			const rruleSignifier = "\u{1F501}".normalize();
			const dv_rruleSignifier = "[repeat::";

			// Get full comment-wrapped triggers
			const deleteTrigger = this.getStyledTrigger(this.settings.deletion_trigger);
			const archiveTrigger = this.getStyledTrigger(this.settings.archive_trigger);
			const bottomTrigger = this.getStyledTrigger(this.settings.bottom_trigger);
			const archiveFilename = this.settings.archive_filepath;

			// Create or get the archive file
			const archiveFile =
				vault.getAbstractFileByPath(archiveFilename) || (await vault.create(archiveFilename, ""));
			if (!(archiveFile instanceof TFile)) {
				const msg = "Problem with Archive filename. (Maybe a directory?)";
				new Notice(msg);
				console.log(msg);
				return;
			}

			let deletedTaskCount = 0;
			let movedTaskCount = 0;
			let archivedTaskCount = 0;

			const writeBackLines: string[] = [];
			const appendLines: string[] = [];
			const archiveLines: string[] = [];

			const fileContentsString = await vault.read(activeFile);
			const fileContentsArray = fileContentsString.split("\n");

			for (const line of fileContentsArray) {
				const thisLine = line;
				const firstFive = thisLine.trim().substring(0, 5).toUpperCase();

				// Only handle completed recurring tasks
				if (
					firstFive === "- [X]" &&
					(thisLine.includes(rruleSignifier) || thisLine.includes(dv_rruleSignifier))
				) {
					if (deleteTrigger && thisLine.includes(deleteTrigger)) {
						deletedTaskCount++;
						continue;
					}
					if (archiveTrigger && thisLine.includes(archiveTrigger)) {
						archiveLines.push(thisLine);
						archivedTaskCount++;
						continue;
					}
					if (bottomTrigger && thisLine.includes(bottomTrigger)) {
						appendLines.push(thisLine);
						movedTaskCount++;
						continue;
					}
					// Completed recurring task with no triggers
					writeBackLines.push(thisLine);
				} else {
					// Not a completed recurring task
					writeBackLines.push(thisLine);
				}
			}

			if (archivedTaskCount > 0) {
				const archiveFileContentsString = await vault.read(archiveFile);
				let archiveFileContentsArray = archiveFileContentsString.split("\n");
				archiveFileContentsArray = archiveFileContentsArray.concat(archiveLines);
				await vault.modify(archiveFile, archiveFileContentsArray.join("\n"));
			}

			const results = writeBackLines.concat(appendLines);
			await vault.modify(activeFile, results.join("\n"));

			const tdMsg = `${deletedTaskCount} tasks deleted\n`;
			const tmMsg = `${movedTaskCount} tasks moved to end of note\n`;
			const taMsg = `${archivedTaskCount} tasks archived\n`;
			const noticeText = tdMsg + tmMsg + taMsg;
			new Notice(noticeText);

		} catch (err) {
			new Notice(String(err));
			console.log(err);
			return;
		}
	}
}
