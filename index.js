const express = require('express');
const { exec, spawn } = require('child_process');

const app = express();
app.use(express.json());

app.post('/scrape_telegram', async (req, res) => {
    // Get parameters from the request body
    const { group_name, action, api_id, api_hash, phone, options } = req.body;

    // Build the command to run the telethon_scraper.js script
    const command = [
        'node', 'telethon_scraper.js',
        `--group_name=${group_name}`,
        `--action=${action}`,
        `${api_id ? `--api_id=${api_id}` : ''}`,
        `${api_hash ? `--api_hash=${api_hash}` : ''}`,
        `${phone ? `--phone="${phone}"` : ''}`,//without "" "+84911233749" -> 84911233749 (minimist will strip out +)
        `${options ? `--options='${JSON.stringify(options)}'` : ''}`,
    ];

    const child = spawn(command[0], command.slice(1));
    let output = '';

    child.stdout.on('data', (data) => {
        output += data.toString();
        console.log(data.toString());
    });

    child.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    child.on('close', (code) => {
        console.log(`Command exited with code ${code}`);

        // const regex = /\[scrape_messages\]:\s(.*)/;
        const regex = new RegExp(`\\[${action}\\]:\\s(.*)`);
        const match = output.match(regex);//"[scrape_messages]: [ANY_TEXT]";
        const result = match?.[1] ? JSON.parse(match[1]) : null;
        // console.log(JSON.stringify(result)); // Outputs "[ANY_TEXT]"

        res.send({ result });
    });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
