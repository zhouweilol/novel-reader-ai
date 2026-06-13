// MD 文件章节标记：必须带 # 标题前缀，避免正文中出现"第一章"字样误识别
const MD_CHAPTER_PATTERNS = [
  /^#+\s+第[一二三四五六七八九十百千\d]+章\s*[^\n]*/m,
  /^#+\s+Chapter\s+\d+[^\n]*/mi,
  /^#+\s+第[一二三四五六七八九十百千\d]+节\s*[^\n]*/m,
];

// TXT 文件章节标记：兼容无 # 前缀的格式
const TXT_CHAPTER_PATTERNS = [
  /^(?:#+\s*)?第[一二三四五六七八九十百千\d]+章\s*[^\n]*/m,
  /^(?:#+\s*)?Chapter\s+\d+[^\n]*/mi,
  /^(?:#+\s*)?第[一二三四五六七八九十百千\d]+节\s*[^\n]*/m,
];

// 从 .txt 内容提取标题和正文
function parseTxt(content: string): { title: string; content: string }[] {
  const lines = content.split('\n');
  const title = lines.find((l) => l.trim())?.trim() || '未命名章节';
  return [{ title, content: content.trim() }];
}

// 从 .md 内容提取标题和正文
function parseMd(content: string): { title: string; content: string }[] {
  const headingMatch = content.match(/^#{1,3}\s+(.+)$/m);
  const title = headingMatch ? headingMatch[1].trim() : '未命名章节';
  return [{ title, content: content.trim() }];
}

// 从指定位置截取标题行（到换行符为止）
function extractTitleLine(text: string, start: number): string {
  const lineEnd = text.indexOf('\n', start);
  return lineEnd === -1
    ? text.slice(start).trim()
    : text.slice(start, lineEnd).trim();
}

// 去掉标题中 markdown # 标记和首尾空白
function cleanTitle(raw: string): string {
  return raw.replace(/^#+\s*/, '').trim();
}

// 去掉正文开头可能残留的标题行
function stripLeadingTitle(title: string, content: string): string {
  const escaped = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`^(?:#{1,3}\\s*)?${escaped}\\s*\\n?`, 'i');
  return content.replace(pattern, '').trim();
}

// 按章节标记拆分为多章
function splitChapters(
  items: { title: string; content: string }[],
  patterns: RegExp[],
): { title: string; content: string }[] {
  if (items.length !== 1) return items;

  const text = items[0].content;
  const combinedPattern = new RegExp(
    patterns.map((p) => p.source).join('|'),
    'gmi',
  );

  const matches = [...text.matchAll(combinedPattern)];
  if (matches.length === 0) {
    const body = stripLeadingTitle(items[0].title, text);
    return [{ title: items[0].title, content: body || text.trim() }];
  }

  const result: { title: string; content: string }[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : text.length;
    const rawTitle = extractTitleLine(text, start);
    const chTitle = cleanTitle(rawTitle);
    const bodyStart = text.indexOf('\n', start) + 1;
    let body = text.slice(bodyStart, end).trim();
    body = stripLeadingTitle(chTitle, body);
    if (body.length > 0) {
      result.push({ title: chTitle, content: body });
    }
  }
  return result.length > 0 ? result : items;
}

export interface ParseResult {
  title: string;
  content: string;
}

export function parseDocument(filename: string, content: string): ParseResult[] {
  const ext = filename.split('.').pop()?.toLowerCase();
  const isMd = ext === 'md' || ext === 'markdown';

  const items: ParseResult[] = isMd ? parseMd(content) : parseTxt(content);

  // MD 文件用严格模式（必须带 #），TXT 用宽松模式
  return splitChapters(items, isMd ? MD_CHAPTER_PATTERNS : TXT_CHAPTER_PATTERNS);
}
