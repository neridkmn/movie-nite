const OpenAI = require("openai");

const openai = new OpenAI({apiKey: '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'});

async function main() {
  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: "I like Lord of the Rings, Titanic, Smurfs. Give me 3 movie suggestions that I can enjoy." }],
    model: "gpt-3.5-turbo",
  });

  console.log(completion.choices[0]);
}

main();