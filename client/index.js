'use strict';

const signalingServer = {
  //
};

async function main() {
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
  const mediaConstraints = {
    audio: false,
    video: true
  };

  const localVideo = document.getElementById('local-video');

  // MediaStream: https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API
  const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

  console.log('stream: ', stream);

  const [videoTracks] = stream.getVideoTracks();

  console.log('video tracks: ', videoTracks);

  localVideo.srcObject = stream;
}

main().catch(err => {
  console.log('ERROR: ', err);
});
