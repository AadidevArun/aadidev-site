(function(){var S=sessionStorage,B=document.body;
var p=S.getItem('hit')?Promise.resolve():(S.setItem('hit','1'),fetch('/api/site',{method:'POST'}));
p.then(function(){return fetch('/api/site')}).then(function(r){return r.json()}).then(function(d){
 if(d.banner&&!S.getItem('bn:'+d.banner)){var b=document.createElement('div');b.id='bn';b.innerHTML='<span></span><button aria-label="Close">×</button>';b.firstChild.textContent=d.banner;b.lastChild.onclick=function(){S.setItem('bn:'+d.banner,1);b.remove()};B.appendChild(b)}
 var f=document.querySelector('.foot,.foot-hint');if(f&&d.total){var s=document.createElement('span');s.textContent=' · // visitor #'+d.total;f.appendChild(s)}
}).catch(function(){})})();
