var login_array = [
  ["admin","5321654987"],
  ["Leo","93176248"],
]














function bubble_sort(arr) {
  console.log("FUNCTION : Sorting array with Bubble-sort.......");
  console.log("Starting array = "+arr+".......");
  let n = arr.length;
  let swapped;
  do {
    swapped = false;
    for (let i = 0; i < n - 1; i++) {
      if (arr[i] > arr[i + 1]) {
        // Swap elements
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        swapped = true;
      }
    }
    n--;
  } while (swapped);
  console.log("Sorted array = "+arr+".......");
  return arr;
}





















//This function generates the boxes for inputing host-count(Lan size) of each network (generated count depends on nuber of networks) 
function generate_network_size_input_boxes(){
  console.log("FUNCTION : Generating network size input boxes.......");
  const number_of_networks = parseInt(document.getElementById("number_of_networks").value);
  const container = document.getElementById("network_size_input_boxes_container");
  container.innerHTML = "";

  for (let i = 1; i <= number_of_networks ; i++ ){
      console.log("Generating size input box for LAN "+i+".......");
      const row = document.createElement("div");
      row.className = "input_network_size_row";

      const box = document.createElement("input");
      box.type = "text";
      box.id = "network_"+i+"_size" ; // network_5_size 
      box.placeholder = "hostů";
      box.className = "input_network_size_box"

      const box_name = document.createElement("p");
      box_name.textContent = "LAN "+i+": ";

      row.appendChild(box_name);
      row.appendChild(box);
      container.appendChild(row);
  }
  console.log("Printing size input boxes.......");
}

for (let i = 0 ; i< login_array.length; i++){
  let str = login_array[i][1];
  let hashed = str.split("").reverse().join("");
  login_array[i][1] = hashed;
}


























//This function generates the final table for VLSM
function calculate_vlsm_table(){
  console.log("FUNCTION : Generating VLSM table.......");
  const container = document.getElementById("vlsm_table_container");
  container.innerHTML = "";
  const number_of_networks = parseInt(document.getElementById("number_of_networks").value);
  const table = document.createElement("table");
  table.className = "vlsm_table";

  //create the first row (info about the columns)
  const r = document.createElement("tr");
  const a = document.createElement("td");
  a.textContent = "LAN";
  a.className = "table_box_text";
  const b = document.createElement("td");
  b.textContent = "Počet hostů";
  b.className = "table_box_text";
  const c = document.createElement("td");
  c.textContent = "Adresa sítě";
  c.className = "table_box_text";
  const d = document.createElement("td");
  d.textContent = "Rozsah";
  d.className = "table_box_text";
  const e = document.createElement("td");
  e.textContent = "Broadcast";
  e.className = "table_box_text";
  const f = document.createElement("td");
  f.textContent = "Maska";
  f.className = "table_box_text";
  r.appendChild(a);
  r.appendChild(b);
  r.appendChild(c);
  r.appendChild(d);
  r.appendChild(e);
  r.appendChild(f);
  table.appendChild(r);


  //Solve the network adresses
  var lan_host_count_original_array = [];
  var lan_host_count_sorted_array = [];
  var lan_size_bitsize_adr_br = []; //is sorted as above and stores [size, bitsize ,net adres, broadcast, mask] net adres and broad cast are stored as [255,255,255,255]
  var current_net_adr = parseInt(document.getElementById("ipv44").value);
  const octet_1_org = parseInt(document.getElementById("ipv41").value);
  const octet_2_org = parseInt(document.getElementById("ipv42").value);
  const octet_3_org = parseInt(document.getElementById("ipv43").value);
  for (let j = 0 ; j < number_of_networks ; j++) {
    lan_host_count_original_array.push(parseInt(document.getElementById("network_"+(j+1)+"_size" ).value) +2);
    lan_host_count_sorted_array.push(parseInt(document.getElementById("network_"+(j+1)+"_size" ).value) + 2);
  }
  console.log("List of Network sizes with (+2 for network,broadcast) "+lan_host_count_original_array+".......");
  //Sort duplicate of array
  var lan_host_count_sorted_array = bubble_sort(lan_host_count_sorted_array);
  
  //Here is where the magic happens and all networks are generated their host_count, bit_size, network_adr, broadcast_adr, mask
  console.log("Starting the main calculation.......");
  //for every network 
  for (let x = number_of_networks-1 ; x >= 0 ; x--) {
    //for every power of 2 all the way to 2**32 (maximum host count in 32bit system)
    for (let y = 0; y < 32 ; y++){
      //if host_count fits in current power of two then we create calculate the network
      if (lan_host_count_sorted_array[x]<=(2**(y+1))){
        console.log("LAN "+(x+1)+"fits in 2**"+(y+1)+" = "+(2**(y+1))+"......."); 
        console.log("Creating LAN "+x+" with configuration :");
        console.log("Size = "+lan_host_count_sorted_array[x]);
        console.log("Bit-size = "+(2**(y+1)));
        console.log("Net-address = "+octet_1_org+"."+octet_2_org+"."+octet_3_org+"."+current_net_adr);
        console.log("Broadcast = "+octet_1_org+"."+octet_2_org+"."+octet_3_org+"."+(current_net_adr+(2**(y+1))-1));
        console.log("Mask = 255.255.255."+(256-(2**(y+1))));
        console.log("................................."); 
        lan_size_bitsize_adr_br.unshift([
          lan_host_count_sorted_array[x],
          (2**(y+1)),
          [octet_1_org, octet_2_org ,octet_3_org , current_net_adr],
          [octet_1_org, octet_2_org ,octet_3_org , current_net_adr+(2**(y+1))-1],
          ([255,255,255,256-(2**(y+1))])
        ]);
        current_net_adr += (2**(y+1));
        break;
      }
    }
  }
  console.log("All networks generated......."); 
     
  


  //This takes care of situations where the prefix is other than /24
  //forst for is for network adr, broadcast, mask
  for(let adr = 0 ; adr < number_of_networks ; adr++){
    console.log("Starting network re-calculations for LAN "+(number_of_networks - adr)+" .......");
    //now lets take care of network adress so this for is for every octet starting from last (octet 4 [3]) exept for first octet bcs we cant really move its value anywhere
    for (let o = 3 ; o > 0 ; o--){
      console.log("Starting re-calculation on octet "+(o+1)+".......");
      for (let x = lan_size_bitsize_adr_br[adr][2][o] ; x > 255 ; x -= 256){
        //THIS LITTLE SUCKER REPEATED LIKE FUCKING 50 000 + TIMES AND DROPPED MY WHOLE FUCKING WEBSITE JUST BECAUSE I MISSED "=" IN "x -= 256"
        console.log("Original net-address = "+lan_size_bitsize_adr_br[adr][2]+".......");
        lan_size_bitsize_adr_br[adr][2][o] -= 256;
        lan_size_bitsize_adr_br[adr][2][o-1] += 1 
        console.log("Shifted net-address = "+lan_size_bitsize_adr_br[adr][2]+".......");
        console.log("Network-address re-calculation FINISHED.......");
      }
    
      //now lets take care of broad cast (this vill be the same as network adres)
      for (let x = lan_size_bitsize_adr_br[adr][3][o] ; x > 255 ; x -= 256){ 
        console.log("Original broadcast = "+lan_size_bitsize_adr_br[adr][3]+".......");
        lan_size_bitsize_adr_br[adr][3][o] -= 256;
        lan_size_bitsize_adr_br[adr][3][o-1] += 1 
        console.log("Shifted broadcast = "+lan_size_bitsize_adr_br[adr][3]+".......");
        console.log("Broadcast-address re-calculation FINISHED.......");
      }
    
    //now lets take care of mask this will be almost the same as the first two cases 
      for (let x = lan_size_bitsize_adr_br[adr][4][o] ; x < 0 ; x += 256){
        console.log("Original Mask = "+lan_size_bitsize_adr_br[adr][4]+".......");
        lan_size_bitsize_adr_br[adr][4][o] += 256;
        lan_size_bitsize_adr_br[adr][4][o-1] -= 1 
        console.log("Shifted Mask = "+lan_size_bitsize_adr_br[adr][4]+".......");
        console.log("Mask re-calculation FINISHED.......");
      }
      console.log("Finished re-calculating octet "+(o+1)+".......");
    }
  }







  
  //this is the final stage of generating and filling the vlsm table
  for (let i = 0 ; i < number_of_networks ; i++) {
    console.log("Constructig LAN "+(i+1)+".......");
    const row = document.createElement("tr");

    //Lan name
    const name = document.createElement("td");
    name.textContent = "LAN "+(i+1);
    name.className = "table_box_text";

    //Lan host count
    const hosts = document.createElement("td");
    hosts.textContent = document.getElementById("network_"+(i+1)+"_size" ).value;
    hosts.className = "table_box_text";

    //Lan network address
    const network_adr = document.createElement("td");
    network_adr.className = "table_box_text";
    //Lan broadcast
    const broadcast = document.createElement("td");
    broadcast.className = "table_box_text";
    //Lan range
    const range = document.createElement("td");
    range.className = "table_box_text";
    //Lan mask
    const mask = document.createElement("td");
    mask.className = "table_box_text";
    
    for (let x = 0 ; x < lan_size_bitsize_adr_br.length ; x++) {
      const network_size =  parseInt(document.getElementById("network_"+(i+1)+"_size" ).value);
      if (network_size+2 == lan_size_bitsize_adr_br[x][0]){
        network_adr.textContent = ""+lan_size_bitsize_adr_br[x][2][0]+"."+lan_size_bitsize_adr_br[x][2][1]+"."+lan_size_bitsize_adr_br[x][2][2]+"."+lan_size_bitsize_adr_br[x][2][3];
        broadcast.textContent =""+lan_size_bitsize_adr_br[x][3][0]+"."+lan_size_bitsize_adr_br[x][3][1]+"."+lan_size_bitsize_adr_br[x][3][2]+"."+lan_size_bitsize_adr_br[x][3][3];
        range.textContent= ""+
        (""+lan_size_bitsize_adr_br[x][2][0]+"."+lan_size_bitsize_adr_br[x][2][1]+"."+lan_size_bitsize_adr_br[x][2][2]+"."+(lan_size_bitsize_adr_br[x][2][3]+1))
        +"-"+
        (""+lan_size_bitsize_adr_br[x][3][0]+"."+lan_size_bitsize_adr_br[x][3][1]+"."+lan_size_bitsize_adr_br[x][3][2]+"."+(lan_size_bitsize_adr_br[x][3][3]-1));
        mask.textContent=""+lan_size_bitsize_adr_br[x][4][0]+"."+lan_size_bitsize_adr_br[x][4][1]+"."+lan_size_bitsize_adr_br[x][4][2]+"."+lan_size_bitsize_adr_br[x][4][3];
        lan_size_bitsize_adr_br[x][0]=-99999999999;
        break;
      }
    }

    //appending all the boxes into one row
    console.log("Appending LAN "+(i+1)+" to the VLSM table.......");
    row.appendChild(name);
    row.appendChild(hosts);
    console.log("LAN "+(i+1)+" host count = "+hosts.textContent+".......");
    row.appendChild(network_adr);
    console.log("LAN "+(i+1)+" network address = "+network_adr.textContent+".......");
    row.appendChild(range);
    console.log("LAN "+(i+1)+" usable range = "+range.textContent+".......");
    row.appendChild(broadcast);
    console.log("LAN "+(i+1)+" broadcast address = "+broadcast.textContent+".......");
    row.appendChild(mask);
    console.log("LAN "+(i+1)+" mask = "+mask.textContent+".......");
    table.appendChild(row);
  }
  //finally append the full table into div
  console.log("Calculation FINISHED printing generated VLSM table.......");
  console.log("#########################################################");
  container.appendChild(table);
}





































function check_prefix_size_against_host_count(){
  console.log("FUNCTION : checking for Prefix x Host count size.......");
  const prefix = parseInt(document.getElementById("prefix").value);
  const max_size = (2**(32-prefix));
  const network_count = parseInt(document.getElementById("number_of_networks").value)
  var size = 0;
  for(let i = 0 ; i < network_count ; i++){
    const network_size =  parseInt(document.getElementById("network_"+(i+1)+"_size" ).value);
    for(let x = 0 ; x < 32 ; x++){
      if ((network_size+2) <= (2**(x+1))){
        size += (2**(x+1));
        break;
      }
    }

  }
  console.log("Prefix allowed network size = "+max_size+".......");
  console.log("Network inputed host size = "+size+".......");
  if (max_size >= size){
    console.log("Network inputed host size fits in Prefix allowed network size.......");
    calculate_vlsm_table();
  } else {
    console.log("Network inputed host size doesnt fit in Prefix allowed network size.......");
    const container = document.getElementById("invalid_name_or_username");
    container.innerHTML = "";
    const a = document.createElement("p");
    a.className = "error_text"
    a.textContent = "Zadaný počet hostů se nevejde do zadaného prefixu !!!";
    container.appendChild(a); 
  }
}





















function check_for_calculate_vlsm_table(){
  console.log("FUNCTION : checking for Username x Password combination.......");
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  var try_count = 0;
  const container = document.getElementById("invalid_name_or_username");
  container.innerHTML = "";
  for (let i = 0 ; i < login_array.length ; i++){
    try_count++ ;
    if ((username == login_array[i][0]) && (password == login_array[i][1])) {
      console.log("Succesful login.......");
      check_prefix_size_against_host_count()
      break;
    }else if (try_count== (login_array.length)){
      console.log("Wrong login, printing error message.......");
      const a = document.createElement("p");
      a.className = "error_text"
      a.textContent = "Špatné jméno nebo heslo !!!";
      container.appendChild(a); 
      break;
    }
  }
  

}
