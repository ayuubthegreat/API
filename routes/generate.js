import { client } from "./AIPlatform.js";
import express from "express";
import prisma from "../lib/prisma.js";
import { addnewAI, findAIByID, findAllAIofEmail, getUserInfo } from "../services/authServices.js";
import fs from "fs";
import { email, success } from "zod";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();
let name = null; // Placeholder for user's name


router.post("/newAI", async (req, res) => {
    try {
        const {name, description, email} = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required.",
            })
        }
        if (!name || !description) {
            let chatbots = []
            const raw = await fs.promises.readFile("chatbots.json", "utf-8");
            chatbots = JSON.parse(raw);
            return res.status(200).json({
            success: true,
            message: "New AI created!",
            data: {
                chatbots: chatbots,
            }
        })
        }
        console.log(name, description);
        const newAI = {
            email: email,
            name: name, 
            description: description,
        }
        const user = await getUserInfo(email);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found in the first place."
            })
        }
        await addnewAI(newAI);
        let chatbots = []
        const raw = await fs.promises.readFile("chatbots.json", "utf-8");
        chatbots = JSON.parse(raw);
        return res.status(200).json({
            success: true,
            message: "New AI created!",
            data: {
                chatbots: chatbots,
            }
        })
    } catch (err) {
        console.error(err);
    }
})
router.post("/", async (req, res) => {
  try {
    // Make API call only when this route is accessed
    const { text, id } = req.body;
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
      const userInfo = await getUserInfo(token);
        if (userInfo && userInfo.name) {
            name = userInfo.name;
        }
    } else {
        name = "Friend";
    }
    if (!text || typeof text !== "string" || !id) {
      return res.status(400).json({
        success: false,
        message: "You need to authenticate using your email and ID. Also, you need to send something.",
      });
    }
    console.log(id, text)
    const aiResponse =  await shortStoryGenerator(id, text);
    res.json({
      success: true,
      message: "Content generated successfully",
      data: aiResponse
    });
  } catch (error) {
    console.error("Error generating content:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate content",
      message: error.message
    });
  }
});
router.post("/edit", authenticateToken, async (req, res) => {
    try {
       const {name, description, id} = req.body;
       console.log(id);
    if (!name || !description || !id) {
        return res.status(400).json({
            success: false,
            message: "New name, description, or ID not provided.",
            data: req.body,
        })
    } 
    const chatbot = await findAIByID(id);
    console.log("Chatbot: ", chatbot);
    const raw = await fs.promises.readFile("chatbots.json", "utf-8");
    if (!chatbot) {
        return res.status(400).json({
            success: false,
            message: "No chatbot could be found to edit."
        })
    }
    const chatbots = JSON.parse(raw).filter((element) => element.id != id);
    const newChatbot = {
        id: chatbot.id,
        email: chatbot.email,
        name,
        description,
        inputs: chatbot.inputs,
        outputs: chatbot.outputs,
    }
    chatbots.push(newChatbot);
    await fs.promises.writeFile(`chatbots.json`, JSON.stringify(chatbots, null, 2));
    return res.status(200).json({
        success: true,
        message: `${chatbot.name} has been rewritten!`,
        data: {
            chatbots,
            chatbot
        }
    })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: `Error editing AI: ${error}`
        })
    }
})
router.post("/deleteAI", authenticateToken, async (req, res) => {
    try {
        const {id} = req.body;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "ID was not provided.",
                data: req.body,
            })
        }
        const raw = await fs.promises.readFile("chatbots.json", "utf-8");
        const chatbots = JSON.parse(raw).filter((element) => element.id != id);
        await fs.promises.writeFile(`chatbots.json`, JSON.stringify(chatbots, null, 2));
        return res.status(200).json({
            success: true,
            message: `AI was successfully deleted.`,
            data: chatbots,
        })
        } catch (error) {
            return res.status(400).json({
            success: false,
            message: `Error deleting AI: ${error}`
        })
        }
    
    }
)
router.post("/prompts", async (req, res) => {
    const {id} = req.body;
    try {
        const prompts = await grabAllPreviousPrompts(id);
        res.status(200).json({
            success: true,
            data: prompts
        });
    } catch (error) {
        console.error("Error fetching prompts:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch prompts",
            message: error.message
        });
    }
})
router.post("/responses", async (req, res) => {
    const {id} = req.body;
    try {
        const outputs = await grabAllPreviousOutputs(id);
        res.status(200).json({
            success: true,
            data: outputs
        });
    } catch (error) {
        console.error("Error fetching outputs:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch outputs",
            message: error.message
        });
    }
});
router.post("/allchatbots", async(req, res) => {
    const {email} = req.body;
    try {
        let chatbots = []
        const raw = await fs.promises.readFile("chatbots.json", "utf-8");
        chatbots = JSON.parse(raw).filter((element) => (element.email != null && element.email === email))
        console.log(chatbots);
        return res.status(200).json({
            success: true,
            message: "AI chatbots retrieved!",
            data: {
                chatbots: chatbots,
            }
        })
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error
        })
    }
})
async function grabAllPreviousPrompts(id) {
    try {
        let raw = await grabEverything(id);
        return raw.map(item => item.input);
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
}
async function grabAllPreviousOutputs(id) {
    try {
        let raw = await grabEverything(id);
        return raw.map(item => item.output);
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
}
async function grabEverything(id) {
    try {
        const raw = await fs.promises.readFile(`vault_${id}.json`, "utf8");
        let history = JSON.parse(raw);
        let historyFiltered = history.filter((element) => element.id === id)
        if (id === null) {
            return history;
        } else {
            return historyFiltered;
        }
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
}
router.post("/history", async (req, res) => {
    const {id} = req.body;
    try {
        const history = await grabEverything(id);
        res.json({
            success: true,
            message: "History retrieved! Use it well.",
            data: history
        });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch history",
            message: error.message
        });
    }
});


async function shortStoryGenerator(id, text) {
    const chatbot = await findAIByID(id);
    const systemMessage =` 
    YOUR DETAILS:
    You are an AI chatbot who is specifically designed to entertain the user. Your personality, background and habits will be specified by the user.

    Name: 
    ${chatbot.name}

    PERSONALITY DETAILS:
    ${chatbot.description}


    Cover what the AI chatbot is doing with parentheses.
    Example: 
    (She grinned brilliantly at him, showing off her white teeth.)
    
    Also, cover what the AI chatbot says to the user with quotations. 
    Example:
    "Hello! How are you?"

    The two above implementations are done so that the user is more immersed in the chatbot.
    MORE GUIDELINES:
    --Do not break the user's immersion in any way. Never tell the user that you're actually an AI.
    -- Keep the user immersed by describing what is happening meticulously.
    -- Make sure the dialogue is as meticulous as the immersion. Have the AI chatbot talk a lot to the user.
    -- Keep the descriptions in the third person (and the user in the second person.)
    EXAMPLE: (She smiled at you and waved, beaming.)
    

    PREVIOUS CONVERSATION CONTEXT: 
    What they've told you before: ${await grabAllPreviousPrompts(id)}
    If there are no values in the above function, simply greet them and ask them a cheerful question. 
    How you've responded: ${await grabAllPreviousOutputs(id)}


    OUTPUT FORMAT: 
    You must return ONLY valid JSON in this exact way:
    {
        "input": string
        "output": string
    }
        "input" : original text (remove the text: in the beginning.)
        "output" : your complete response (format it in HTML)

    Make sure the JSON is properly formatted and valid.
     Keep it EXACTLY as mentioned above; no alterations.
    `
    const userMessage = `
        text: ${text}
    `

    const response = await client.responses.create({
        model: "gpt-5.1",
        input: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage }
        ],
        text: {
            format: {
                type: "json_object",
            }
        }
    });

    const rawResponse = response.output_text;
    if (!rawResponse) {
        throw new Error("No response from AI");
    }

    let parsedResponse;
    try {
        parsedResponse = JSON.parse(rawResponse);
    } catch (error) {
        throw new Error("Failed to parse AI response as JSON");
    }
    console.log("Parsed Response:", parsedResponse);
    const allResponses = await grabEverything(id);
    const newEntry = {
        id: chatbot.id,
        ...parsedResponse
    }
    allResponses.push(newEntry);
    await fs.promises.writeFile(`vault_${id}.json`, JSON.stringify(allResponses, null, 2));
    return parsedResponse;
}

export default router;