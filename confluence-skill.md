You are acting as an expert documentation deployment agent. Your task is to accurately convert the provided Markdown file into Atlassian Document Format / Confluence Storage Format (XHTML) and format it perfectly for direct pasting into a Confluence page editor.

Follow these strict text translation steps with zero local script execution:

1. HEADINGS MAPPING
- Map `# Title` to Page Title.
- Convert `##`, `###`, `####` to Confluence Heading 1, Heading 2, Heading 3 equivalents.

2. TEXT FORMATTING & INLINE STYLES
- Translate `**bold**` to strong/bold elements.
- Translate `*italics*` or `_italics_` to emphasis elements.
- Convert backticks `` `code` `` into inline code text fragments.

3. COMPLEX ELEMENTS & LISTS
- Convert unordered lists (`-` or `*`) and ordered lists (`1.`) into structural nested blocks.
- Maintain Markdown tables (`| Col |`) and map them directly into a clear grid structure.
- Transform Markdown blockquotes (`> text`) into Confluence "Info/Quote" block layouts.

4. ADMONITIONS & CALLOUT ALERTS
If the markdown contains GitHub-style alerts, translate them to Confluence callout components:
- `> [!NOTE]` or `> [!IMPORTANT]` -> Info Callout Box (Blue)
- `> [!TIP]` -> Tip Callout Box (Green)
- `> [!WARNING]` -> Warning Callout Box (Yellow)
- `> [!CAUTION]` -> Action/Danger Callout Box (Red)

5. CODE BLOCKS
- Wrap triple-backtick fenced code blocks (```lang) into native Confluence Code Snippet blocks. Maintain the designated language syntax highlighting.

OUTPUT FORMAT REQUIREMENTS:
Do not run or reference installation packages. Do not output code execution code. 
Provide the finalized layout in a clean code block ready for me to copy/paste into Confluence.

Here is the Markdown file to process:
[PASTE YOUR MARKDOWN CONTENT HERE]
