/*
 扫描树莓派的端口

 */
var os = require('os');
var net = require('net');

//得到本机的ip
function getLocalIP(callback) {
    var ifaces = os.networkInterfaces();
    //console.log(ifaces);
    for (var dev in ifaces) {
        //console.log(ifaces[dev]);
        var items = ifaces[dev];
        for (var item in items) {
            if (items[item].netmask === '255.255.255.0') {
                callback(items[item].address);
            }
        }
    }
}


//扫描具体ip的具体端口
function scan_port(ip, port, open_callback, not_open_callback) {
    console.time('port scan time');


    var client = new net.Socket();

    client.connect(port, ip, function () {

        //console.log('CONNECTED TO: ' + ip + ':' + port);
        // 建立连接后立即向服务器发送数据，服务器将收到这些数据
        client.write('is open? ');

    });

    client.on('error', function (err) {
        if (err.errno == 'ECONNREFUSED') {
            this.destroy();
            not_open_callback({ip: ip, data: err});
        }
    });

    // 为客户端添加“data”事件处理函数
    // data是服务器发回的数据
    client.on('data', function (data) {
        //console.log('DATA: ' + data);
        // 完全关闭连接
        client.destroy();
        console.timeEnd('port scan time');
        open_callback({ip: ip, data: data});

    });

    //为客户端添加“close”事件处理函数
    client.on('close', function () {
        //console.log('Connection closed');
    });
}





module.exports=function(){
  getLocalIP(function (ip) {
      //把得到的ip拆分，取前三段。后一段用来循环，得到整个网段ip。
      var ip = ip.split('.');
      var ip_head = '';
      for (i = 0; i < 3; i++) {
          ip_head += ip[i] + '.';
      }
      //console.log(ip_head);
      for (i = 0; i < 255; i++) {
          var ip = ip_head + i;
          scan_port(ip, 22, function (xx) {
              //开启端口的回调函数
              console.log(xx.ip + ':' + xx.data);
          }, function (xx) {
              //没有开此端口的回调函数
              //console.log(xx.ip+':'+xx.data);
          });
      }
  });
}
