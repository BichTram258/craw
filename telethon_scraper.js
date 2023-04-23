const { exec } = require('child_process');
const apiKeyPool = require('./api_key_pool');

function getRandomConfig() {
    const randomIndex = Math.floor(Math.random() * apiKeyPool.length);
    return apiKeyPool[randomIndex];
}

function runPythonScript({ group_name, action, options, customApiKeyConfig }) {

    const config = customApiKeyConfig ? customApiKeyConfig : getRandomConfig();
    console.log(config);

    const {api_id, api_hash, phone} = config

    return new Promise((resolve, reject) => {
        const command = `python3 telethon_scraper.py --group_name ${group_name} --action ${action} --api_id ${api_id} --api_hash ${api_hash} --phone ${phone} ${options ? `--options ${options}` : ''}`
        console.log(command)
        exec(command, {maxBuffer: 100 * 1024 * 1024}, (err, stdout, stderr) => {
            if (err) {
                reject(err);
                return;
            }
            if (stderr) {
                reject(stderr);
                return;
            }
            resolve(stdout);
        });
    });
}

//group_name 'jobremotevn' || 'corgidoge_official' || 'Kucoin_News' || 'jobremotevn' || 'GROUP_NAME';
async function main() {
    const args = require('minimist')(process.argv.slice(2));
    console.log(args)

    const {group_name = '', action = '', options, api_id, api_hash, phone} = args || {}

    //If an API key is provided by the frontend, it should be used instead of generating a random one on the server.
    const customApiKeyConfig = api_id ? { api_id, api_hash, phone } : null

    const data = await runPythonScript({ group_name, action, options, customApiKeyConfig });

    //don't remove this log: this log is important in format [${action}]: ${data} -> use regex to parse and return JSON data to frontend after finished running command
    console.log(`[${action}]: ${data}`);
}

main().catch(console.error);
