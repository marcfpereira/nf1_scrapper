
const fs = require('fs');
const puppeteer = require('puppeteer');

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017', {useNewUrlParser: true});


var TweetsSchema = new mongoose.Schema({
    user: String,
    date: String,
    body: String
});

var Tweet = mongoose.model('Tweet', TweetsSchema);


function extractItems() {
    const extractedElements = document.querySelectorAll('.tweet');

    const items = [];
    for (let element of extractedElements) {
        element.querySelector(".tweet-text").innerText;
        element.querySelector(".fullname").innerText;

        items.push(element);
    }
    return items;
}


async function scrapeInfiniteScrollItems(
    page,
    extractItems,
    itemTargetCount,
    scrollDelay = 1000,
) {
    let items = [];
    try {
        let previousHeight;
        while (items.length < itemTargetCount) {
            items = await page.evaluate(extractItems);
            console.log(items)
            previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
            await page.waitFor(scrollDelay);
        }
    } catch(e) { }
    return items;
}

(async () => {
    // Set up browser and page.
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 926 });

    // Navigate to the demo page.
    await page.goto('https://twitter.com/realdonaldtrump');

    // Scroll and extract items from the page.
    const items = await scrapeInfiniteScrollItems(page, extractItems, 100);

    // Save extracted items to a file.

    fs.writeFileSync('./items.txt', items.join('\n') + '\n');

    // Close the browser.
    await browser.close();
})();





/*
const axios = require('axios');
const cheerio = require('cheerio');

// Aquí creem un pont per conectar la base de dades

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017', {useNewUrlParser: true});

//Si no hi ha cap error, executem tot el que tinguem dins de la funció:

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

    //Creem la taula amb els camps que necessitem.

    var TweetsSchema = new mongoose.Schema({
        user: String,
        date: String,
        body: String
    });

    //Creem una fila amb els camps de la taula.
    var Tweet = mongoose.model('Tweet', TweetsSchema);


    const url = 'https://twitter.com/marianorajoy?lang=es';

    const recoveredTweets = [];

    axios(url)
        .then(response => {
            const html = response.data;
            const $ = cheerio.load(html);
            const tweets = $('.tweet');

            let tweetSaved = 0;

            tweets.each(function() {
                const user = $(this).find('.fullname').text();
                const body = $(this).find('.tweet-text').text();
                const data = $(this).find('._timestamp').attr('data-time');

                    var tweetToSave = new Tweet({ user: user, date: data, body:body });

                    tweetToSave.save(function (err, tweetToSave) {
                         if (err) return console.error(err);

                       tweetSaved= tweetSaved +1;
                       console.log(tweetSaved);

                    // tweetprueba.speak();
                });


            });
            // console.log(recoveredTweets);
        })
        .catch(console.error);


});













/*


    var tweetprueba = new Tweet({ user: 'Ronaldinho', date: "2019-05-15 12:00", tweet: "Tweet de prueba! :D"});
    console.log(tweetprueba);

    tweetprueba.save(function (err, tweetprueba) {
        if (err) return console.error(err);
        // tweetprueba.speak();
    });

*/






