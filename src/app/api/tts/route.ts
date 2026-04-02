import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text");

  if (!text || text.trim().length === 0 || text.length > 50) {
    return new NextResponse("Invalid input", { status: 400 });
  }

  const apiKey = process.env.AZURE_TTS_KEY;
  const region = process.env.AZURE_TTS_REGION;
  if (!apiKey || !region) {
    return new NextResponse("TTS not configured", { status: 503 });
  }

  const ssml = `<speak version='1.0' xml:lang='zh-CN'>
    <voice name='zh-CN-XiaoxiaoNeural'>
      <prosody rate='0.85'>${text.trim()}</prosody>
    </voice>
  </speak>`;

  const response = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
      },
      body: ssml,
    }
  );

  if (!response.ok) {
    return new NextResponse("TTS request failed", { status: 502 });
  }

  const audio = await response.arrayBuffer();

  return new NextResponse(audio, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
