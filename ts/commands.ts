import { spawn } from "child_process";
import { Message } from "discord.js";
import { Commands } from "dd-botkit";
import publicIp from "public-ip";

export const HugoReachability: Commands = {
    opts: {
        environments: ['dm', 'text'],
        category: 'Reachability'
    },
    commands: [
        {
            opts: {
                name: "get-ip",
                node: "read.ip",
                usage: {
                    description: "Gets the external IP address of this bot"
                }
            },
            handler: async (message, next) => {
                const status = await message.reply(`One moment please 🔎`) as Message;

                const v4 = await publicIp.v4({ https: true }).catch(e => "Failed to resolve IPv4 address");
                const v6 = await publicIp.v6({ https: true }).catch(e => "Failed to resolve IPv6 address");

                await status.edit(`\`\`\`\nIPv4: ${v4}\nIPv6: ${v6}\n\`\`\``);
            }
        },
        {
            opts: {
                name: "open-serveo",
                node: "write.serveo",
                usage: {
                    description: "Opens a serveo tunnel",
                    args: [
                        {
                            name: "from",
                            type: "number",
                            description: "The port to request from serveo"
                        },
                        {
                            name: "ip",
                            type: "string",
                            description: "IP or FQDN to tunnel"
                        },
                        {
                            name: "to",
                            type: "number",
                            description: "The port to open locally"
                        }
                    ]
                }
            },
            handler: async (message, next) => {
                const status = await message.reply(`One moment please 🔎`) as Message;
                const [from, ip, to] = message.args as [number, string, number];

                const proc = spawn(`ssh`, ['-R', `${from}:${ip}:${to}`, "serveo.net"]);

                proc.on('exit', async () => {
                    // closed
                    await status.edit(`🚨 Tunnel ${from}:${ip}:${to} via Servo has closed!`)
                });

                proc.on('error', console.error);
                
                async function dataListener(data: string) {
                    if (!data.includes("Forwarding") || !data.includes("serveo.net")) {
                        console.log(data.toString());
                        return;
                    }
                    proc.stdout.removeListener('data', dataListener);
                    let [ host ] = data.toString().split(' ').reverse();
                    host = host.split('serveo.net')[0] + 'serveo.net';

                    // open
                    await status.edit(`✅ Now tunnelling ${from}:${ip}:${to} via Serveo - subdomain: ${host}`);
                }
                proc.stdout.on('data', dataListener);
            }
        }
    ]
}