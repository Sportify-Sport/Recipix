window.onload = function() {
    // document.getElementById("loading-container").style.display = "flex";
    setTimeout(function() {
      const authUrl = `${config.domain}/login?` +
             `client_id=${config.clientId}` +
             `&response_type=token` +
             `&scope=email+openid` +
             `&redirect_uri=${encodeURIComponent(config.redirectUri)}`;
             
         window.location.href = authUrl;
    }, 1000);
};

function getUrlParameters() {
  const hasParams = new URLSearchParams(window.location.hash.substring(1));
  return Object.fromEntries(hasParams);
}



const params = getUrlParameters();
if (params.id_token) {
  const decodedIdToken = JSON.parse(atob(params.id_token.split('.')[1]));
  sessionStorage.setItem('user', JSON.stringify(decodedIdToken));
  console.log(decodedIdToken);
}