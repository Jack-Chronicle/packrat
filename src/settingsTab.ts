import { App, PluginSettingTab, Setting } from "obsidian";
import type PackratPlugin from "./main";
import { PackratSettings } from "./settingsData";

export class PackratSettingTab extends PluginSettingTab {
	plugin: PackratPlugin;

	public defaultDeletionTrigger = "%%done_del%%";
	public defaultBottomTrigger = "%%done_end%%";
	public defaultArchiveTrigger = "%%done_log%%";
	public defaultArchiveFilepath = "archive.md";
	public defaultTriggerCommentStyle = "%% {trigger} %%";

	constructor(app: App, plugin: PackratPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Packrat plugin settings" });

		// Info Help Text
		containerEl.createEl("div", {
			text: "Define your trigger comment style with {trigger} as a placeholder. E.g., '%% {trigger} %%' or '<!-- {trigger} -->'.",
			cls: "packrat-settings-info"
		});

		// ------- Live preview block container -----
		const previewDiv = containerEl.createDiv({ cls: "packrat-settings-info" });
		const updatePreview = () => {
			previewDiv.empty();
			const style = this.plugin.settings.trigger_comment_style || "%% {trigger} %%";
			previewDiv.createEl("div", { text: "Preview of your triggers:" });
			const ul = previewDiv.createEl("ul");
			ul.createEl("li", {
				text: `Deletion: ${style.replace("{trigger}", this.plugin.settings.deletion_trigger)}`
			});
			ul.createEl("li", {
				text: `Move to end: ${style.replace("{trigger}", this.plugin.settings.bottom_trigger)}`
			});
			ul.createEl("li", {
				text: `Archive: ${style.replace("{trigger}", this.plugin.settings.archive_trigger)}`
			});
		};
		updatePreview();

		// ------- Trigger comment style input -------
		new Setting(containerEl)
			.setName("Trigger Comment Style")
			.setDesc('Template for triggers. Use {trigger} as placeholder (e.g. "%% {trigger} %%").')
			.addText(text =>
				text
					.setPlaceholder('%% {trigger} %%')
					.setValue(this.plugin.settings.trigger_comment_style)
					.onChange(async (value) => {
						this.plugin.settings.trigger_comment_style = value || '%% {trigger} %%';
						await this.plugin.saveSettings();
						updatePreview(); // Just update preview, don't re-render all
					})
			);

		// ------- Deletion Trigger -------
		new Setting(containerEl)
			.setName("Deletion trigger")
			.setDesc("Trigger keyword, e.g., 'done_del'")
			.addText((text) =>
				text
					.setPlaceholder("done_del")
					.setValue(this.plugin.settings.deletion_trigger)
					.onChange(async (value) => {
						this.plugin.settings.deletion_trigger = value;
						await this.plugin.saveSettings();
						updatePreview();
					})
			);

		// ------- Move to end trigger -------
		new Setting(containerEl)
			.setName('"Move to end of file" trigger')
			.setDesc("Trigger keyword, e.g., 'done_end'")
			.addText((text) =>
				text
					.setPlaceholder("done_end")
					.setValue(this.plugin.settings.bottom_trigger)
					.onChange(async (value) => {
						this.plugin.settings.bottom_trigger = value;
						await this.plugin.saveSettings();
						updatePreview();
					})
			);

		// ------- Archive trigger -------
		new Setting(containerEl)
			.setName("Archive trigger")
			.setDesc("Trigger keyword, e.g., 'done_log'")
			.addText((text) =>
				text
					.setPlaceholder("done_log")
					.setValue(this.plugin.settings.archive_trigger)
					.onChange(async (value) => {
						this.plugin.settings.archive_trigger = value;
						await this.plugin.saveSettings();
						updatePreview();
					})
			);

		// ------- Archive file path -------
		new Setting(containerEl)
			.setName("Archive file")
			.setDesc('Relative filepath to archive file (include ".md" extension)')
			.addText((text) =>
				text
					.setPlaceholder("archive.md")
					.setValue(this.plugin.settings.archive_filepath)
					.onChange(async (value) => {
						this.plugin.settings.archive_filepath = value;
						await this.plugin.saveSettings();
					})
			);
	}
}