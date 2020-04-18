const { App } = require('@slack/bolt');
const fetch = require('node-fetch');

// Initializes your app with your bot token and signing secret
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
});

// listen to a button click, actions are itentified by action_id
app.action('button_click', async ({ body, ack, say }) => {
    // Acknowledge the action
    await ack();
    await say(`<@${body.user.id}> clicked the button`);
});

app.message(/^(corona|corona stats|corona india).*/, async ({ message, say }) => {
    sayStats(message.user, say);
});

const sayStats = (user, say) => {
    const getStatisticsUrl = 'https://api.thevirustracker.com/free-api?countryTimeline=IN';
    const statistics = fetch(getStatisticsUrl)
        .then(res => res.json())
        .then( async res => {
            const statistics = res.timelineitems[0];
            const allKeys = Object.keys(statistics);
            const lastKey = allKeys.reverse()[1];
            const todayStats = statistics[lastKey];

            await say({
                blocks: [
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `<@${user}>, here is the statistics of Coronavirus in India`
                        },
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": `• *New daily cases* ${todayStats.new_daily_cases} \n • *New daily deaths* ${todayStats.new_daily_deaths} \n • *Total cases* ${todayStats.total_cases} \n • *Total recoveries* ${todayStats.total_recoveries} \n • *Total deaths* ${todayStats.total_deaths} \n`
                        }
                    },
                ]
            });
        });
}

(async () => {
    // Start your app
    await app.start(process.env.PORT || 8000);
    console.log('⚡️ Bolt app is running!');
})();

