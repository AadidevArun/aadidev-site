(function(){var t=document.title,id,m=['👀 Come back!','🥺 Aadidev misses you','🏏 Still batting, come back!'],i=0;
document.addEventListener('visibilitychange',function(){clearInterval(id);if(document.hidden){t=document.title;document.title=m[0];id=setInterval(function(){document.title=m[++i%m.length]},1500)}else{document.title='🎉 Welcome back!';setTimeout(function(){document.title=t},1500)}})})();
