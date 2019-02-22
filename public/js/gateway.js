$( document ).ready(function() {
  var containers = %%%CONTAINERS%%%;
  var taisunport = %%%TAISUNPORT%%%;
  var pass = "%%%TAISUNAUTH%%%";
  // Loop through containers contained in response and render links
  $(containers).each(function(index,container){
  var labels = container.Labels;
  if (labels.stacktype){
    if (labels.appport && container.State == 'running'){
      var iconurl = labels.stackurl.replace('.yml','.png').replace('/templates/','/icons/');
      var linkurl = window.location.href.replace('taisun-gateway', 'user:' + pass + '@' + labels.appport);
      $('#stacks').append('\
        <div class="mx-auto" style="width:140px;cursor:pointer;" onclick="window.open(\'' + linkurl + '\',\'_blank\');">\
          <center><img src="' + iconurl + '">\
          <h4 class="card-title">'+ labels.stackname + '</h4></center>\
        </div>\
      ');
    }
    else if (labels.devport && container.State == 'running' && labels.ide == 'VDI'){
      var linkurl = window.location.href.replace('taisun-gateway', 'user:' + pass + '@' + taisunport) + '/desktop/' + container.Id;
      $('#dev').append('\
        <div class="mx-auto" style="width:140px;cursor:pointer;" onclick="window.open(\'' + linkurl + '\',\'_blank\');">\
          <center><img src="/public/img/terminal.png">\
          <h4 class="card-title">'+ labels.stackname + '</h4></center>\
        </div>\
      ');
    }
    else if (labels.stacktype && container.State == 'running' && labels.stacktype == 'terminal'){
      var linkurl = window.location.href.replace('taisun-gateway', 'user:' + pass + '@' + taisunport) + '/terminal/' + container.Id;
      $('#term').append('\
        <div class="mx-auto" style="width:140px;cursor:pointer;" onclick="window.open(\'' + linkurl + '\',\'_blank\');">\
          <center><img src="/public/img/terminal.png">\
          <h4 class="card-title">'+ labels.stackname + '</h4></center>\
        </div>\
      ');
    }
    else if (labels.devport && container.State == 'running'){
      var linkurl = window.location.href.replace('taisun-gateway', 'user:' + pass + '@' + labels.devport);
      $('#dev').append('\
        <div class="mx-auto" style="width:140px;cursor:pointer;" onclick="window.open(\'' + linkurl + '\',\'_blank\');">\
          <center><img src="/public/img/terminal.png">\
          <h4 class="card-title">'+ labels.stackname + '</h4></center>\
        </div>\
      ');
    }
    else if (labels.stacktype == 'vdi' && container.State == 'running'){
      var linkurl = window.location.href.replace('taisun-gateway', 'user:' + pass + '@' + taisunport) + '/desktop/' + container.Id;
      $('#vdi').append('\
        <div class="mx-auto" style="width:140px;cursor:pointer;" onclick="window.open(\'' + linkurl + '\',\'_blank\');">\
          <center><img src="/public/img/monitor.png">\
          <h4 class="card-title">'+ labels.stackname + '</h4></center>\
        </div>\
      ');
    }
  }
  });
  // Add Taisun link
  var taisunurl = window.location.href.replace('taisun-gateway', 'user:' + pass + '@' + taisunport);
  $('#taisun').append('\
    <div class="mx-auto" style="width:140px;cursor:pointer;" onclick="window.open(\'' + taisunurl + '\',\'_blank\');">\
      <center><img src="/public/img/taisun.png">\
      <h4 class="card-title">Taisun</h4></center>\
    </div>\
  ');
});
