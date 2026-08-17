import Parser from 'rss-parser';
const parser = new Parser();
async function run() {
  try {
    const q = 'site:lokmat.com OR site:esakal.com OR site:loksatta.com OR site:maharashtratimes.com';
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=mr&gl=IN&ceid=IN:mr`;
    console.log("Fetching:", url);
    const feed = await parser.parseURL(url);
    console.log(`Found ${feed.items.length} items`);
    if(feed.items.length > 0) console.log(feed.items[0].title);
  } catch (e) {
    console.error(e);
  }
}
run();
