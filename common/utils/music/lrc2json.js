/**
* 将歌词字符串转换成json格式
* 如将字符串:
* [ti: Title]\n[ar: Artist]\n[au: Author]\n[al: Album]\n[by: Creator]\n[length: 03:00]\n[re: Editor]\n[ve: Version]\n[00:00.00]Begin\n[03:00.00]End
* 转换为：
* {
  "ti": "Title",
  "ar": "Artist",
  "au": "Author",
  "al": "Album",
  "by": "Creator",
  "length": "03:00",
  "re": "Editor",
  "ve": "Version",
  "lyrics": [
    {
      "time": "00:00.00",
      "text": "Begin"
    },
    {
      "time": "03:00.00",
      "text": "End"
    }
  ]
}
*使用方法：
* const lrcJson = lrc2json(lrcString)
*/
const EOL = typeof window === 'undefined' ? require('os').EOL : '\n';

function lrc2json(data) {
  const lines = data.split(EOL);

  const tags = [];
  const lyrics = [];
  const result = {};

  const tagRegExp = /\[([a-z]+)\:(.*)\]/; // e.g. [ar: Linkin Park]
  const lyricsRegExp = /\[([0-9]{2}\:[0-9]{2}\.[0-9]{2})\](.*)/; // e.g. [04:31.02]I bleed it out

  for (let i = 0; i < lines.length; i++) {
    if (tagRegExp.test(lines[i])) {
      tags.push(lines[i]);
    } else {
      break;
    }
  }
  lines.splice(0, tags.length);

  for (let i = 0; i < tags.length; i++) {
    const matches = tagRegExp.exec(tags[i]);
    if (matches) {
      const [, key, value] = matches;
      result[key] = value.trim();
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const matches = lyricsRegExp.exec(lines[i]);
    if (matches) {
      const [, time, text] = matches;
      lyrics.push({
        time: time,
        text: text,
      });
    }
  }

  result['lyrics'] = lyrics;

  return result;
}

module.exports = {
	lrc2json,
};