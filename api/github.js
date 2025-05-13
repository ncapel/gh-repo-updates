export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const event = req.headers['x-github-event'];

    if (event === 'ping') {
        console.log("Received GitHub ping:", req.body);
        return res.status(200).send('Pong!');
    }

    const { pusher, repository, commits } = req.body;

    if (!commits || !Array.isArray(commits)) {
        console.error("Invalid or missing commits array in payload:", req.body);
        return res.status(400).send("Invalid payload: 'commits' must be an array.");
    }

    const commitMessages = commits.map(commit =>
        `[\`${commit.id.slice(0, 7)}\`](${commit.url}) ${commit.message}`
    ).join('\n');

    let DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

    if (repository.name === "units-6-7-react-chat-bit-by-bit") {
        DISCORD_WEBHOOK_URL += `?thread_id=${process.env.TEAM_B}`;
    } else if (repository.name === "units-6-7-react-chat-gryffindor") {
        DISCORD_WEBHOOK_URL += `?thread_id=${process.env.TEAM_A}`;
    }

    const payload = {
        username: 'GitHub Bot',
        embeds: [
            {
                title: `📦 New push to ${repository.name}`,
                description: `**${pusher.name}** pushed to \`${repository.default_branch}\`:\n\n${commitMessages}`,
                color: 0x5865F2,
            },
        ],
    };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        return res.status(200).send('OK');
    } catch (err) {
        console.error('Error posting to Discord:', err);
        return res.status(500).send('Failed to post to Discord');
    }
}
