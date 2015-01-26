class UdpSocket

    @ab2str: (buf) =>
        return String.fromCharCode.apply null, new Uint8Array(buf)

    @str2ab: (str) =>
        buf = new ArrayBuffer str.length
        bufView = new Uint8Array buf
        for i, _ of str
            bufView[i] = str.charCodeAt i
        return buf

    constructor: (@options) ->
        @localPort_ = options.localPort
        @loopback_ = options.loopback

        @socketId_ = -1
        @multicastAddr_ = null

        @_init()

    _init: ->
        info =
            'persistent': false,
            'name': 'udpSocket',
            'bufferSize': 4096
        chrome.sockets.udp.create info, (createInfo) =>
            console.log 'create UdpSocket: ', @socketId_
            @socketId_ = createInfo.socketId
            chrome.sockets.udp.bind @socketId_, '0.0.0.0', @localPort_, (result) =>
                console.log 'bind UdpSocket: port=', @localPort_, ', result=', result

                # set packet listener
                chrome.sockets.udp.onReceive.addListener (info)=>
                    if @socketId_ is info.socketId
                        @_onMessage UdpSocket.ab2str(info.data)

                # set error listener
                chrome.sockets.udp.onReceive.addListener (info)=>
                    if @socketId_ is info.socketId
                        @_onError 'error'

    _onMessage: (data)->
        console.log 'received packet:\n', data
        if @onmessage
            @onmessage data

    _onError: (error) ->
        if @onerror
            @onerror error


    joinGroup: (addr) ->
        @multicastAddr_ = addr
        chrome.sockets.udp.joinGroup @socketId_, addr, (result)=>
            console.log 'joinGroup UdpSocket: addr=', addr, ', result=', result

    send: (addr, data) ->
        _data = UdpSocket.str2ab data
        chrome.sockets.udp.send @socketId_, addr, @localPort_, (sendInfo) =>
            if sendInfo.resultCode < 0 # fail
                console.error 'UdpSocket: send error!!!'
            else # success
                console.log 'UdpSocket: send success, ', sendInfo.bytesSent

module.exports = UdpSocket
