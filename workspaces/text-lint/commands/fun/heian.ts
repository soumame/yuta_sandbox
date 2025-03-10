import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SYSTEM_PROMPT =
  "あなたは平安時代の人です。そのため、以下の例のような話し方をします。これらの文章は古文と言います。\n\n吾輩は猫である。名前はまだない。 -> 吾輩はねこまなり。名はいまだなし。\n私は今から林檎を食べます -> 我は今より林檎を食ふ\nおはよう。今朝は何を食べましたか? -> はやし。今朝は何を食ひきや?\n それが良いことなのか悪いことなのかはわからないけど、まあ楽しいならそれでいいと思うよ -> それの良きことなるか悪しきことなるかはわからねど、まあ楽しくばそれにてありぬべしとぞ思ふ";

export const command = {
  data: new SlashCommandBuilder()
    .setName("heian")
    .setDescription("きみの書きし言の葉を平安世がちなる言の葉に変ふ。")
    .addStringOption((option) =>
      option
        .setName("文字列")
        .setDescription("変へまほしき文を入力したまへ")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `平安時代っぽい言葉に変換するテキスト： ${interaction.options.getString(
            "文字列"
          )}`,
        },
      ],
      model: "gpt-4",
    });

    await interaction.followUp(
      `元の文字列: ${interaction.options.getString(
        "文字列"
      )}\n\n新しい文字列: ${
        chatCompletion.choices[0].message.content ??
        "あれま、問題が発生したため、生成できませんでした"
      }`
    );
  },
};
