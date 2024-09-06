# process-this-text README

In this extension exist som interesting text to text commans

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

Need some of this diff programs:
* meld
* kdiff3
* xxdiff
* diffuse

## Extension Settings

This extension contributes the following settings:

* `processThisText.diffTool`: Specifies the diff tool to use for comparing files. You can set this to one of the available diff tools installed on your system, such as `meld`, `xxdiff`, `kdiff3`, or `diffuse`. The default value is `meld`.

### Example Configuration

To configure the diff tool, you need to add the following setting in your `settings.json`:

```json
{
    "processThisText.diffTool": "meld"
}
```

## Known Issues

* When you have VS code instlled from snap, then you can have problems lounching programs in terminal.
Prefere a deb version when install.

## Release Notes

About the versions

### 0.0.1

Initial release of extension


---

## Following extension guidelines


* [Extension Guidelines](https://github.com/trucomanx/extension-process-this-text/blob/main/README.md)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Repository in github](https://github.com/trucomanx/extension-process-this-text)

**Enjoy!**
