export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { pusher, repository, commits } = req.body;

    const commitMessages = commits.map(commit =>
        `[\`${commit.id.slice(0, 7)}\`](${commit.url}) ${commit.message}`
    ).join('\n');

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

    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
    if (repository.name === "units-6-7-react-chat-bit-by-bit") {
        DISCORD_WEBHOOK_URL += `?thread_id=${process.env.TEAM_B}`
    } else if (repository.name === "units-6-7-react-chat-gryffindor") {
        DISCORD_WEBHOOK_URL += `?thread_id=${process.env.TEAM_A}`
    }

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
