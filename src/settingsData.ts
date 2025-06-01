import { PluginSettingTab } from 'obsidian';

export interface PackratSettings {
	deletion_trigger: string;
	bottom_trigger: string;
	archive_trigger: string;
	archive_filepath: string;
	trigger_comment_style: string;
}

export const DEFAULT_SETTINGS: PackratSettings = {
	deletion_trigger: 'done_del',
	bottom_trigger: 'done_end',
	archive_trigger: 'done_log',
	archive_filepath: 'archive.md',
	trigger_comment_style: '%% {trigger} %%',
}
