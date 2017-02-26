$(document).ready(function() {
    
var month_Names = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];

var month_shortNames = [ "Janu", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
    
var day_Names= ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

var new_Date = new Date();

var mydate = new_Date.toLocaleString('en', {day:'numeric',month:'short', year:'numeric' });

var FromDate = new_Date.getFullYear() + ' -' + ('0' + (new_Date.getMonth() + 1)).slice(-2) + ' -' + ('0' + new_Date.getDate()).slice(-2);

var CurrentDate = ('0' + new_Date.getDate()).slice(-2)+' '+month_shortNames[new_Date.getMonth()] + ' ' + new_Date.getFullYear()+' ';


new_Date.setDate(new_Date.getDate());



//time = time.toLocaleString('en-GB', {day:'numeric',month:'short', year:'numeric',hour: 'numeric',minute:'numeric',second:'numeric', hour12: true });

var myhour = new_Date.toLocaleString('en-GB', {hour12: true, });
setInterval( function() {
    
  // $("#date").html(new_Date.getDate()+"/"+new_Date.getMonth()+"/"+new_Date.getFullYear());
  $("#date").html(CurrentDate);
   }, 1000);
 
   
   
   
setInterval( function() {
   var hours =getHoursnow()
   $("#hours").html(hours);
   }, 1000);
   
 setInterval( function() {
   var minutes = new Date().getMinutes();
   $("#min").html(( minutes < 10 ? "0" : "" ) + minutes);
   },1000);
   
  setInterval( function() {
   var seconds = new Date().getSeconds();
   $("#sec").html(( seconds < 10 ? "0" : "" ) + seconds);
   },1000);

 ///////////////////
 
 
function getHoursnow(){
 var   date_format = 12;
var d       = new Date();
var hour    = d.getHours();  /* Returns the hour (from 0-23) */
var minutes     = d.getMinutes();  /* Returns the minutes (from 0-59) */
var result  = hour;
var ext     = '';
if(date_format == '12'){
    if(hour > 12){
        ext = 'PM';
        hour = (hour - 12);

        if(hour < 10){
            result = "0" + hour;
        }else if(hour == 12){
            hour = "00";
            ext = 'AM';
        }
    }
    else if(hour < 12){
        result = ((hour < 10) ? "0" + hour : hour);
        ext = 'AM';
    }else if(hour == 12){
        ext = 'PM';
    }
}


result = result; 
return result;
}
//////////////////////////
var today=new Date();
var noon=new Date(today.getFullYear(),today.getMonth(),today.getDate(),12,0,0);
var ampm = (today.getTime()<noon.getTime())?'AM':'PM';

  
   setInterval( function() {
   var hours = new Date().getHours();
   $("#hourformat").html(ampm);
   }, 1000);
   
});