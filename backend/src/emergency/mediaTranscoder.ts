import fs from 'fs/promises';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

type ProbeStream = {
  codec_name?: string;
  codec_type?: string;
};

type ProbeResult = {
  streams?: ProbeStream[];
};

const ffprobeJson = async (filePath: string): Promise<ProbeResult> => {
  const { stdout } = await execFileAsync(
    'ffprobe',
    [
      '-v',
      'error',
      '-print_format',
      'json',
      '-show_streams',
      filePath,
    ],
    {
      maxBuffer: 1024 * 1024 * 4,
    }
  );

  return JSON.parse(stdout) as ProbeResult;
};

const isBrowserFriendlyVideo = (probe: ProbeResult) => {
  const streams = probe.streams || [];
  const videoStream = streams.find((stream) => stream.codec_type === 'video');
  const audioStream = streams.find((stream) => stream.codec_type === 'audio');

  if (!videoStream) {
    return false;
  }

  const hasCompatibleVideo = videoStream.codec_name === 'h264';
  const hasCompatibleAudio = !audioStream || audioStream.codec_name === 'aac';

  return hasCompatibleVideo && hasCompatibleAudio;
};

export const ensureBrowserCompatibleVideo = async (filePath: string) => {
  const probe = await ffprobeJson(filePath);

  if (isBrowserFriendlyVideo(probe)) {
    return filePath;
  }

  const tempPath = `${filePath}.transcoding.mp4`;

  try {
    await execFileAsync(
      'ffmpeg',
      [
        '-y',
        '-loglevel',
        'error',
        '-nostats',
        '-i',
        filePath,
        '-map',
        '0:v:0',
        '-map',
        '0:a?',
        '-movflags',
        '+faststart',
        '-vf',
        'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        tempPath,
      ],
      {
        maxBuffer: 1024 * 1024 * 8,
      }
    );

    await fs.rename(tempPath, filePath);
    return filePath;
  } catch (error) {
    await fs.rm(tempPath, { force: true }).catch(() => undefined);
    throw error;
  }
};
