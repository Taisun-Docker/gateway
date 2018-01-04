$( document ).ready(function() {
  var containers = %%%CONTAINERS%%%;
  var taisunport = %%%TAISUNPORT%%%;
  // Loop through containers contained in response and render links
  $(containers).each(function(index,container){
  var labels = container.Labels;
  if (labels.stacktype){
    if (labels.appport && container.State == 'running'){
      var iconurl = labels.stackurl.replace('.yml','.png').replace('/templates/','/icons/');
      $('#stacks').append('\
        <div class="mx-auto" style="width:140px;cursor:pointer;" onclick="window.location=\'/87bdc7b8-a9f2-4857-a94a-9dffe4cec434?port=' + labels.appport + '\';">\
          <center><img src="' + iconurl + '">\
          <h4 class="card-title">'+ labels.stackname + '</h4></center>\
        </div>\
      ');
    }
    else if (labels.devport && container.State == 'running'){
      $('#dev').append('\
        <div class="mx-auto" style="width:140px;cursor:pointer;" onclick="window.location=\'/87bdc7b8-a9f2-4857-a94a-9dffe4cec434?port=' + labels.devport + '\';">\
          <center><img src="/3f4349dd-54f9-46ab-bab4-33c6fad6a995/img/terminal.png">\
          <h4 class="card-title">'+ labels.stackname + '</h4></center>\
        </div>\
      ');
    }
    else if (labels.stacktype == 'vdi' && container.State == 'running'){
      $('#vdi').append('\
        <div class="mx-auto" style="width:140px;cursor:pointer;" onclick="window.location=\'/87bdc7b8-a9f2-4857-a94a-9dffe4cec434?port=' + taisunport + '&path=desktop/' + container.Id + '\';">\
          <center><img src="/3f4349dd-54f9-46ab-bab4-33c6fad6a995/img/monitor.png">\
          <h4 class="card-title">'+ labels.stackname + '</h4></center>\
        </div>\
      ');
    }
  }
  });
  // Add Taisun link
  $('#taisun').append('\
    <div class="mx-auto" style="width:140px;cursor:pointer;" onclick="window.location=\'/87bdc7b8-a9f2-4857-a94a-9dffe4cec434?port=' + taisunport + '\';">\
      <center><img src="/3f4349dd-54f9-46ab-bab4-33c6fad6a995/img/taisun.png">\
      <h4 class="card-title">Taisun</h4></center>\
    </div>\
  ');
});
