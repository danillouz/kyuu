'use strict';

const signalingServer = {
  //
};

// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
const mediaConstraints = {
  audio: true,
  video: true
};

const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const startCallButton = document.getElementById('start-call');
const endCallButton = document.getElementById('end-call');

let localConn;
let remoteConn;

let localStream;
let remoteStream;

let localVideoTracks;
let localAudioTracks;

function _getOtherPeer(conn) {
  return conn === localConn ? remoteConn : localConn;
}

function _createPeerConnection(servers) {
  const peerConnection = new RTCPeerConnection(servers);

  peerConnection.addEventListener('icecandidate', async event => {
    const { target: conn, candidate } = event;

    console.log('event [icecandidate] connection: ', conn);

    if (candidate) {
      const newCandidate = new RTCIceCandidate(candidate);
      const otherPeer = _getOtherPeer(conn);

      await otherPeer.addIceCandidate(newCandidate);

      console.log('added ICE candidate');
    }
  });

  peerConnection.addEventListener('iceconnectionstatechange', event => {
    const { target: conn } = event;

    console.log('event [iceconnectionstatechange] connection:', conn);

    //
  });

  peerConnection.addEventListener('addstream', event => {
    console.log('event [addstream] stream:', event.stream);

    const { stream } = event;

    remoteVideo.srcObject = stream;

    remoteStream = stream;
  });

  return peerConnection;
}

async function startCall(event) {
  console.log('start call');

  startCallButton.disabled = true;
  endCallButton.disabled = false;

  // MediaStream: https://developer.mozilla.org/en-US/docs/Web/API/Media_Streams_API
  localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);

  localVideo.srcObject = localStream;

  const [videoTracks] = localStream.getVideoTracks();
  const [audioTracks] = localStream.getAudioTracks();

  if (videoTracks) {
    console.log(`using video device ${videoTracks.label}`);

    localVideoTracks = videoTracks;
  }

  if (audioTracks) {
    console.log(`using audio device ${audioTracks.label}`);

    localAudioTracks = audioTracks;
  }

  const servers = null;

  localConn = _createPeerConnection(servers);
  remoteConn = _createPeerConnection(servers);

  console.log('local conn: ', localConn);
  console.log('remote conn: ', remoteConn);

  localConn.addStream(localStream);

  const offer = await localConn.createOffer();

  await localConn.setLocalDescription(offer);
  await remoteConn.setRemoteDescription(offer);

  const answer = await remoteConn.createAnswer();

  await remoteConn.setLocalDescription(answer);
  await localConn.setRemoteDescription(answer);
}

async function endCall(event) {
  console.log('end call');

  remoteConn.close();
  localConn.close();

  remoteStream = null;
  localStream = null;

  remoteVideo.srcObject = null;
  localVideo.srcObject = null;

  localVideoTracks.stop();
  localAudioTracks.stop();

  startCallButton.disabled = false;
  endCallButton.disabled = true;
}

startCallButton.addEventListener('click', startCall);
endCallButton.addEventListener('click', endCall);
