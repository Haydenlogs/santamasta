  setTimeout(() => {
    console.clear();
    console.log(`
     )     (    (       )                )  (   (   (      
 ( /(     )\ ) )\ ) ( /(    (  (     ( /(  )\ ))\ ))\ )   
 )\())(  (()/((()/( )\())   )\))(   ')\())(()/(()/(()/(   
((_)\ )\  /(_))/(_)|(_)\   ((_)()\ )((_)\  /(_))(_))(_))  
 _((_|(_)(_)) (_))   ((_)  _(())\_)() ((_)(_))(_))(_))_   
| || | __| |  | |   / _ \  \ \((_)/ // _ \| _ \ |  |   \  
| __ | _|| |__| |__| (_) |  \ \/\/ /| (_) |   / |__| |) | 
|_||_|___|____|____|\___/    \_/\_/  \___/|_|_\____|___/  
                                                                                                          
                                                                              
 It seems you've stumbled upon the console! How could this be? Curious one I see... Well just to be reassuring, there's nothing to see here. :)
 If you're looking for anything specific, it won't be here... (That's a hint by the way). Maybe look at another page?
        `)
  setTimeout(() => {
    console.error = function() {};  // Disables error messages
console.warn = function() {};   // Disables warnings
console.log = function() {};    // Disables log messages

  }, 1000);
  }, 7000);