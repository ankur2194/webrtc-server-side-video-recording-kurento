var kurentoIp = '192.168.31.133', // replace this with your kurento server IP
    kurentoPort = '8888', // replace this with your kurento server port
    fileSavePath = 'file:///tmp/abc.webm'; // replace this with your path & file name

var args = {
    ws_uri: 'ws://' + kurentoIp + ':' + kurentoPort + '/kurento',
    file_uri: fileSavePath
};

var remoteVideo,
    webRtcPeer,
    client,
    pipeline;

const IDLE = 0;
const DISABLED = 1;
const CALLING = 2;
const PLAYING = 3;

function setStatus(nextState) {
    switch (nextState) {
        case IDLE:
            $('#stop').attr('disabled', true);
            $('#play').attr('disabled', false);
            break;

        case CALLING:
            $('#stop').attr('disabled', false);
            $('#play').attr('disabled', true);
            break;

        case PLAYING:
            $('#stop').attr('disabled', false);
            $('#play').attr('disabled', true);
            break;

        case DISABLED:
            $('#stop').attr('disabled', true);
            $('#play').attr('disabled', true);
            break;
    }
}

window.onload = function () {
    remoteVideo = document.getElementById('remoteVideo');

    setStatus(IDLE);
}

function play() {
    setStatus(DISABLED);

    webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly({
        remoteVideo: remoteVideo
    }, (error) => {
        if (error) return onError(error);
        webRtcPeer.generateOffer(onPlayOffer);
    });
}

function onPlayOffer(error, sdpOffer) {
    if (error) return onError(error);

    co(function* () {
        try {
            if (!client)
                client = yield kurentoClient(args.ws_uri);

            pipeline = yield client.create('MediaPipeline');
            var webRtc = yield pipeline.create('WebRtcEndpoint');
            setIceCandidateCallbacks(webRtcPeer, webRtc, onError);
            var player = yield pipeline.create('PlayerEndpoint', { uri: args.file_uri });
            player.on('EndOfStream', stop);
            yield player.connect(webRtc);
            var sdpAnswer = yield webRtc.processOffer(sdpOffer);
            webRtc.gatherCandidates(onError);
            webRtcPeer.processAnswer(sdpAnswer);
            yield player.play();
            setStatus(PLAYING);
        }
        catch (e) {
            onError(e);
        }
    })();
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