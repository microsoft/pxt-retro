(function() {
    if (window.ksRunnerInit) return;

    // This line gets patched up by the cloud
    var pxtConfig = {
    "relprefix": "/pxt-retro/",
    "workerjs": "/pxt-retro/worker.js",
    "tdworkerjs": "/pxt-retro/tdworker.js",
    "monacoworkerjs": "/pxt-retro/monacoworker.js",
    "pxtVersion": "2.1.5",
    "pxtRelId": "",
    "pxtCdnUrl": "/pxt-retro/",
    "commitCdnUrl": "/pxt-retro/",
    "blobCdnUrl": "/pxt-retro/",
    "cdnUrl": "/pxt-retro/",
    "targetVersion": "0.0.0",
    "targetRelId": "",
    "targetUrl": "",
    "targetId": "retro",
    "simUrl": "/pxt-retro/simulator.html",
    "partsUrl": "/pxt-retro/siminstructions.html",
    "runUrl": "/pxt-retro/run.html",
    "docsUrl": "/pxt-retro/docs.html",
    "isStatic": true
};

    var scripts = [
        "/pxt-retro/highlight.js/highlight.pack.js",
        "/pxt-retro/bluebird.min.js",
        "/pxt-retro/typescript.js",
        "/pxt-retro/semantic.js",
        "/pxt-retro/marked/marked.min.js",
        "/pxt-retro/lzma/lzma_worker-min.js",
        "/pxt-retro/blockly/blockly_compressed.js",
        "/pxt-retro/blockly/blocks_compressed.js",
        "/pxt-retro/blockly/msg/js/en.js",
        "/pxt-retro/pxtlib.js",
        "/pxt-retro/pxtcompiler.js",
        "/pxt-retro/pxtblocks.js",
        "/pxt-retro/pxteditor.js",
        "/pxt-retro/pxtsim.js",
        "/pxt-retro/target.js",
        "/pxt-retro/pxtrunner.js"
    ]

    if (typeof jQuery == "undefined")
        scripts.unshift("/pxt-retro/jquery.js")

    var pxtCallbacks = []

    window.ksRunnerReady = function(f) {
        if (pxtCallbacks == null) f()
        else pxtCallbacks.push(f)
    }

    window.ksRunnerWhenLoaded = function() {
        pxt.docs.requireHighlightJs = function() { return hljs; }
        pxt.setupWebConfig(pxtConfig || window.pxtWebConfig)
        pxt.runner.initCallbacks = pxtCallbacks
        pxtCallbacks.push(function() {
            pxtCallbacks = null
        })
        pxt.runner.init();
    }

    scripts.forEach(function(src) {
        var script = document.createElement('script');
        script.src = src;
        script.async = false;
        document.head.appendChild(script);
    })

} ())
