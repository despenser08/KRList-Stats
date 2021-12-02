import { bold, codeBlock, hyperlink, inlineCode, italic, quote, strikethrough } from "@discordjs/builders";
import { marked } from "marked";
import { table } from "table";

export default class MarkedRenderer extends marked.Renderer {
  public images: string[] = [];
  private tableHeader: string[] = [];
  private tableAlign: ("center" | "justify" | "left" | "right")[] = [];
  private tableData: string[][] = [];

  public blockquote(blockQuote: string) {
    return quote(blockQuote);
  }
  public br() {
    return "\n";
  }
  public checkbox(checked: boolean) {
    return `[${checked ? "x" : " "}]`;
  }
  public code(code: string, language: string) {
    return codeBlock(code, language);
  }
  public codespan(code: string) {
    return inlineCode(code);
  }
  public del(text: string) {
    return strikethrough(text);
  }
  public em(text: string) {
    return italic(text);
  }
  public heading(text: string) {
    return `\n${bold(text)}\n\n`;
  }
  public hr() {
    return "---";
  }
  public image(href: string, title: string, text: string) {
    this.images.push(href);
    return hyperlink(`[설명 이미지 #${this.images.length}${text ? ` (${text})` : ""}]`, href, title);
  }
  public link(href: string, title: string, text: string) {
    return hyperlink(text, href, title);
  }
  public list(body: string, ordered: boolean, start: number) {
    return `${ordered ? `${start}.` : "-"} ${body}\n`;
  }
  public listitem(text: string) {
    return `- ${text}\n`;
  }
  public paragraph(text: string) {
    return `${text}\n`;
  }
  public strong(text: string) {
    return bold(text);
  }
  public table() {
    this.tableData.pop();
    return codeBlock(
      table([this.tableHeader, ...this.tableData], {
        columnDefault: { width: Math.round(50 / this.tableHeader.length) },
        columns: this.tableAlign.map((align) => ({ alignment: align }))
      })
    );
  }
  public tablecell(content: string, flags: { header: boolean; align: "center" | "left" | "right" }) {
    if (flags.header) this.tableHeader.push(content);
    else this.tableData[this.tableData.length - 1].push(content);
    this.tableAlign.push(flags.align || "justify");
    return content;
  }
  public tablerow(content: string) {
    this.tableData.push([]);
    return content;
  }
}
