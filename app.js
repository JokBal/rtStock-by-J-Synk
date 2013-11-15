(function(){

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// Setup Variables and Objects
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

var stocks         = {}
,   stock_tickers  = PUBNUB.$("stock-tickers")
,   stock_template = PUBNUB.$("stock-template").innerHTML;

var pubnub         = PUBNUB.init({
    windowing     : 200,
    timeout       : 2000,
    subscribe_key : 'demo'
});

Pusher.log = function(message) {
  if (window.console && window.console.log) {
    window.console.log(message);
  }
};


var event_name = "stock-event";
var API_KEY = 'a080e81530d15631ff70';
var pusher = new Pusher(API_KEY);
var stock_list =  new Array ("KT","SK","SAMSUNG","LG","SOMA","NIPA","CAPTCHA","MyPleasure","LOL","GameAddiction","Government","ParkeunHae");

for(var i in stock_list){
    start_stream(stock_list[i]);
}

function start_stream(id) {

    pusher.subscribe(id);
    pusher.bind(id,function(data){
        update_stock(data.stream,id);
    });    

}
function stop_stream(id) {
    pubnub.css( pubnub.$("stock-id-"+id), { background : "#ecf0f1" } );
    pusher.unsubscribe(id);
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// Update a Ticker Value on Screen
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function update_stock( data, ticker ) {

    // Add Name
    data['name'] = ticker;

    // Setup Ticker Display
    var stock = stocks[ticker] = ticker in stocks &&
    stocks[ticker] || (function(){
        var div   = pubnub.create('div')
        ,   stock = {};

        // Remember Ticker ID
        data.ticker = data.id = ticker
        div.innerHTML = pubnub.supplant( stock_template, data );

        // Populate UI
        stock_tickers.insertBefore( div, first_div(stock_tickers) );

        // Update References
        stock['box']    = pubnub.$('stock-id-'     + ticker);
        stock['name']   = pubnub.$('stock-name-'   + ticker);
        stock['time']   = pubnub.$('stock-time-'   + ticker);
        stock['price']  = pubnub.$('stock-price-'  + ticker);
        stock['delta']  = pubnub.$('stock-delta-'  + ticker);
        stock['perc']   = pubnub.$('stock-perc-'   + ticker);
        stock['vol']    = pubnub.$('stock-vol-'    + ticker);
        stock['switch'] = pubnub.$('stock-switch-' + ticker);

        // Add Flipswitch
        flipswitch( ticker, function( on, off ) {
            console.log( on, off, ticker );
            if (on)  start_stream(ticker);
            if (off) stop_stream(ticker)
        } );

        // Return References
        return stock;
    })();

    // Update UIstock
    update_stock_display( data, stock );
}

function update_stock_display( data, stock ) {
    var delta = data.delta;

    stock['time'].innerHTML  = data.time;
    stock['price'].innerHTML = "$"+data.price; 
    stock['delta'].innerHTML = (delta > 0 ? "+" : "") + delta;
    stock['perc'].innerHTML  = "("+data.perc+"%)";
    stock['vol'].innerHTML   = "Vol: " + data.vol;

    pubnub.css( stock['box'], {
        background : delta > 0 ? "#2ecc71" : "#e74c3c"
    } );
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// Flip Switch ON/OFF
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function flipswitch( id, callback ) {
    var ticker        = pubnub.$('stock-id-' + id)
    ,   ticker_switch = pubnub.$('stock-switch-' + id)

    pubnub.bind( 'mousedown,touchstart', ticker, function() {
        var on        = pubnub.attr( ticker, 'data-on' )
        ,   state     = on=='on'
        ,   on_off    = (state?'off':'on')
        ,   classname = 'switch-'+ on_off +' switch-animate';

        // Flip For Later Switching
        pubnub.attr( ticker, 'data-on', on_off )

        // Update UI
        pubnub.attr( ticker_switch, 'class', classname );
        ticker_switch.className = classname;

        // Run User Callback
        callback( !state, state );

        return false;
    } );
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// Start and Stop Streams
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// Load History Example Code
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
var load_history_btn = pubnub.$('load-history-example')
,   history_out      = pubnub.$('output-history-example');

pubnub.bind( 'mousedown,touchstart', load_history_btn, function() {
    pubnub.history({
        limit    : 5,
        channel  : 'MSFT',
        callback : function(msgs) {
            history_out.innerHTML = JSON.stringify(msgs[0]);
        }
    });

    return false;
} );


// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
// 
// General Utility Functions
// 
// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
function clean(text)    { return (''+text).replace( /[<>]/g, '' ) }
function first_div(elm) { return elm.getElementsByTagName('div')[0] }
function zeropad(num)   { return (''+num).length > 1 ? ''+num : '0'+num }
function date_out() {
    var now = new Date()
    ,   min = now.getMinutes()
    ,   hrs = now.getHours();

    return pubnub.supplant( '{hours}:{minutes}<sup>{pmam}</sup>', {
        hours   : zeropad(hrs > 12 ? (hrs - 12) || 1 : hrs || 1),
        minutes : zeropad(min),
        pmam    : hrs > 11 ? 'pm' : 'am'
    } );
}

})();
