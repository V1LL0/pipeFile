// at this point everything has loaded already

var peerId = $('body').data('peer'),
    key    = $('body').data('key'),
    sender = $('body').data('sender');


var peer = new Peer(peerId, {config: backupServersConfig, key: key});

peer.on('connection', function(conn) {

  conn.on('data', function(data) {

    saveData(data.file, data.fileName);
  });

});

var conn = peer.connect(sender);

conn.on('open', function(id) {
  conn.send({id: peerId});
});

var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, filename) {
        var blob = new Blob([data], {type: "octet/stream"}),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

