var kurentoIp = '192.168.31.133', // replace this with your kurento server IP
    kurentoPort = '8888', // replace this with your kurento server port
    fileSavePath = 'file:///tmp/abc.webm'; // replace this with your path & file name

var args = {
    ws_uri: 'ws://' + kurentoIp + ':' + kurentoPort + '/kurento',
    file_uri: fileSavePath
};

var localVideo,
    remoteVideo,
    webRtcPeer,
    client,
    pipeline;

const IDLE = 0;
const DISABLED = 1;
const CALLING = 2;

function setStatus(nextState) {
    switch (nextState) {
        case IDLE:
            $('#start').attr('disabled', false);
            $('#stop').attr('disabled', true);
            break;

        case CALLING:
            $('#start').attr('disabled', true);
            $('#stop').attr('disabled', false);
            break;

        case DISABLED:
            $('#start').attr('disabled', true);
            $('#stop').attr('disabled', true);
            break;
    }
}

window.onload = function () {
    localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');

    setStatus(IDLE);
}

function start() {
    setStatus(DISABLED);

    webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv({
        localVideo: localVideo,
        remoteVideo: remoteVideo
    }, (error) => {
        if (error) return onError(error);
        webRtcPeer.generateOffer(onStartOffer);
    });
}

function stop() {
    if (webRtcPeer) {
        webRtcPeer.dispose();
        webRtcPeer = null;
    }

    if (pipeline) {
        pipeline.release();
        pipeline = null;
    }

    setStatus(IDLE);
}

function onStartOffer(error, sdpOffer) {
    if (error) return onError(error);

    co(function* () {
        try {
            if (!client)
                client = yield kurentoClient(args.ws_uri);

            pipeline = yield client.create('MediaPipeline');
            var webRtc = yield pipeline.create('WebRtcEndpoint');
            setIceCandidateCallbacks(webRtcPeer, webRtc, onError);
            var recorder = yield pipeline.create('RecorderEndpoint', { uri: args.file_uri });
            yield webRtc.connect(recorder);
            yield webRtc.connect(webRtc);
            yield recorder.record();
            var sdpAnswer = yield webRtc.processOffer(sdpOffer);
            webRtc.gatherCandidates(onError);
            webRtcPeer.processAnswer(sdpAnswer);

            setStatus(CALLING);
        } catch (e) {
            onError(e);
        }
    })();
}

function onError(error) {
    if (error) {
        console.error(error);
        stop();
    }
}

function setIceCandidateCallbacks(webRtcPeer, webRtcEp, onerror) {
    webRtcPeer.on('icecandidate', function (candidate) {
        candidate = kurentoClient.getComplexType('IceCandidate')(candidate);
        webRtcEp.addIceCandidate(candidate, onerror);
    });

    webRtcEp.on('OnIceCandidate', function (event) {
        var candidate = event.candidate;
        webRtcPeer.addIceCandidate(candidate, onerror);
    });
}