---
layout: page
categories: [avatax, api]
product: avatax
doctype: use_cases
image: /public/images/avatax-demo-img.png 
twitterImage: https://developer.avalara.com/public/images/avatax-demo-img.png 
---
<body onload="updateAddress()">
    <script type='text/javascript'>
        var map;
        const infoboxTemplate = `
            <div class="demo-infobox">
                <h4 id="demo-infobox-header" style="display: inline;">Getting Started</h4>
                <i class="glyphicon glyphicon-remove" id="demo-infobox-icon" style="display: inline;float: right;padding-top:5px;" onClick="hideInfobox()"></i>
                <p id="demo-infobox-text" style="margin-bottom:0;">
                    Calculating sales tax is time consuming and painful, but it doesn\'t have to be. Avalara\'s sales tax API automates the process for you! All you need to do to start making quick calculations is choose a product or service and where you\'re shipping from and to. Tinker with the options on the left, click "Submit" and watch the magic happen!
                </p>
                <div class="loading-pulse" style="display: none;margin-top:35px;"></div>
            </div>
        `;
        function displayToolTip(showInfobox) {
            if (showInfobox || showInfobox === undefined) {
                const topLeft = (map.getPageX(), map.getPageY());
                //Create an infobox that will render in the top left of the map.
                const infobox = new Microsoft.Maps.Infobox(topLeft, {
                    htmlContent: infoboxTemplate,
                });
                //Assign the infobox to a map instance.
                infobox.setMap(map);
            }
            return;
        }
        function GetMapWithLine(destLat, destLong, srcLat, srcLong, usAddresses, showInfobox) {
            if(destLat === null || destLong === null) {
                map = new Microsoft.Maps.Map('#myMap', {zoom: 3});
                displayToolTip(showInfobox);
            } else if(srcLat === null || srcLong === null) {
                //Single location layer (pushpin)
                var location  = new Microsoft.Maps.Location(destLat, destLong);         
                map = new Microsoft.Maps.Map('#myMap', {center: location});
                const pin = new Microsoft.Maps.Pushpin(location, {
                    color: '#ff6600',
                    title: $('input[type=radio][name=address]:checked').attr('city') + ' Office'
                })
                displayToolTip(showInfobox);
                map.entities.push(pin)
                //Exit out since it is a single location.
            } else if (srcLat != null && destLat != null){
                //Source and destination layer (polyline)
                map = new Microsoft.Maps.Map('#myMap', {});
                center = map.getCenter();
                let srcLocation = new Microsoft.Maps.Location(srcLat, srcLong);
                let destLocation = new Microsoft.Maps.Location(destLat, destLong);
                var coords = [destLocation, srcLocation];
                var line = new Microsoft.Maps.Polyline(coords, {strokeColor: 'orange', strokeThickness: 3});
                displayToolTip(showInfobox);
                map.entities.push(line);
                map.setView({
                    center: new Microsoft.Maps.Location(srcLat + 1, destLong + 1),
                    zoom: usAddresses ? 4 : 2,
                });
            }
            return;
        }
    </script>
    <script type='text/javascript' src='https://www.bing.com/api/maps/mapcontrol?callback=GetMapWithLine&key=Ahgp_E6MHtyMYBJPCllMKTwJk7Indytl8hVm-Boe6mbyWbcyZvVBUePMDP5OLeiH' async defer ></script>
    <!-- demo container -->
    <div class="row">
        <!-- shortcuts container -->
        <div class="col-md-3">
            <!-- page header -->
            <h1 style="margin-top:0;">Sales Tax API Demo</h1>
            <div id="demo-shortcuts">
                <!-- steps to submit -->
                <div class="row">
                    <!-- step 1 / ship to -->
                    <p class="demo-step">Step 1: Where are you shipping to?</p>
                    <div class="demo-option">
                        <p>Choose a pre-selected address</p>
                        <form id="dest-addresses" onChange="updateAddress();" class="demo-form">
                            <!-- loop thru addresses -->
                            {% for address in site.data.demo_page.addresses %}
                                <label class="demo-label-container">
                                    <input id="{{ address.city }}" name="address" type="radio" value="{{ address.value }}" lat="{{ address.lat }}" long="{{ address.long }}" class="demo-radio" city="{{ address.city }}" addressType="{{ address.type }}" {% if address.selected %} checked {% endif %}/>
                                    <span class="demo-label"> {{ address.city }}</span>
                                    <br>
                                    <i class="glyphicon glyphicon-map-marker demo-city-marker"></i> 
                                    {{ address.street }}
                                    <br>
                                    {% if address.region %}
                                        <span class="demo-city-zip">{{ address.region }}</span>
                                        <br>
                                    {% endif %}
                                    <span class="demo-city-zip">{{ address.countryZip }}</span>
                                </label>
                                <br>
                            {% endfor %}
                        </form>
                    </div>
                    <hr>
                    <!-- step 2 / products -->
                    <p class="demo-step">Step 2: What's being taxed?</p>
                    <div class="demo-option">
                        <p>Choose a common product or service to calculate tax</p>
                        <form id="products" onChange="fillWithSampleData();" class="demo-form">
                            <!-- loop thru products -->
                            {% for product in site.data.demo_page.products %}
                                <label class="demo-label-container">
                                    <!-- radio input -->
                                    <input value="{{ product.taxCode }}" name="product" id="{{ product.inputId }}" type="checkbox" description="{{ product.name }}" class="demo-radio" {{ product.checked }}/>
                                    <!-- amount input -->
                                    <input value="{{ product.value }}" type="text" id="{{ product.inputId }}-amount" hsCode="{{ product.hsCode }}" style="width: 50px;">
                                    <!-- label and sublabel -->
                                    <span class="demo-label"> {{ product.name }} </span>
                                    {% if product.subLabel %}
                                        <span>{{ product.subLabel }}</span>
                                    {% endif %}
                                </label>
                                <br>
                            {% endfor %}
                        </form>
                    </div>
                    <hr>
                    <!-- step 3 / ship from -->
                    <p class="demo-step">Step 3: Where are you shipping from? (optional) </p>
                    <div class="demo-option">
                        <p>Choose a pre-selected address</p>
                        <form id="src-addresses" onChange="updateAddress();" class="demo-form">
                            <!-- loop thru addresses -->
                            {% for address in site.data.demo_page.addresses %}
                                <label class="demo-label-container">
                                    <input name="srcAddress" type="radio" value="{{ address.value }}" lat="{{ address.lat }}" long="{{ address.long }}" class="demo-radio" addressType="{{ address.type }}"/>
                                    <span class="demo-label"> {{ address.city }}</span>
                                    <br>
                                    <i class="glyphicon glyphicon-map-marker demo-city-marker"></i> 
                                    {{ address.street }}
                                    <br>
                                    {% if address.region %}
                                        <span class="demo-city-zip">{{ address.region }}</span>
                                        <br>
                                    {% endif %}
                                    <span class="demo-city-zip">{{ address.countryZip }}</span>
                                </label>
                                <br>
                            {% endfor %}
                        </form>
                    </div>
                </div>
            </div>
            <!-- end shortcuts -->
        </div>
        <!-- map and api details container -->
        <div class="col-md-9">
            <!-- map row -->
            <div class="row">
                <div id="myMap"></div>
            </div>
            <!-- api details row -->
            <div class="row" id="demo-api-details">
                <!-- request output -->
                <div class="console-req-container api-console-output col-md-6" id="demo-console-req" >
                    <div class="row" style="margin-top:15px;margin-left:10px;margin-right:10px;">
                        <h5 class="console-output-header" style="display:inline-block;margin-left:0px;">
                            Request
                        </h5>
                        <div class="form-group" style="display: inline;" onChange="fillWithSampleData();">
                            <select class="form-control" id="req-type" style="display: inline;width: 100px;">
                                <option value="JSON">JSON</option>
                                <option value="cURL">cURL</option>
                                <option value="C#">C# SDK</option>
                                <option value="PHP">PHP SDK</option>
                                <option value="Python">Python SDK</option>
                                <option value="Ruby">Ruby SDK</option>
                                <option value="Java">Java SDK</option>
                                <option value="JS">JS SDK</option>
                            </select>
                        </div>
                        <div style="display:inline-block;float:right;" class="btn-group">
                            <button class="btn btn-link demo-console-btn copy-btn" type="submit" onClick="copyToClipboard('#demo-console-input');">
                                <i class="glyphicon glyphicon-copy" title="Copy"></i>
                            </button>
                            <button class="btn btn-link demo-console-btn">
                                <a href="https://developer.avalara.com/api-reference/avatax/rest/v2/models/CreateTransactionModel/" target="_blank">
                                    <i class="glyphicon glyphicon-list-alt" title="Docs"></i>
                                </a>
                            </button>
                            <button class="btn btn-primary" type="button" onClick="ApiRequest();" style="display:block;">
                                Submit
                            </button>
                        </div>
                    </div>
                    <div class="code-snippet reqScroll" id="demo-console-req" style="height:400px;">
                        <pre id="demo-console-input">{ }</pre>
                    </div>
                </div>
                <!-- response output -->
                <div class="col-md-6 console-res-container api-console-output" id="demo-console-res">
                    <div class="row" style="margin-top:15px;margin-left:10px;margin-right:10px;">
                        <h5 class="console-output-header" style="display:inline-block;margin-left:0px;">
                            Response
                        </h5>
                        <div style="display:inline-block;float:right;" class="btn-group">
                            <button class="btn btn-link demo-console-btn copy-btn" type="submit" onClick="copyToClipboard('#demo-console-output');">
                                <i class="glyphicon glyphicon-copy"></i>
                            </button>
                            <button class="btn btn-link demo-console-btn">
                                <a href="https://developer.avalara.com/api-reference/avatax/rest/v2/models/TransactionModel/" target="_blank">
                                    <i class="glyphicon glyphicon-list-alt"></i>
                                </a>
                            </button>
                        </div>
                    </div>
                    <div class="code-snippet respScroll" style="height:400px;">
                        <div class="loading-pulse" style="display: none;"></div>
                        <pre id="demo-console-output">{ }</pre>
                    </div>
                </div>
                <!-- end response output -->
            </div>
            <!-- end api details row-->
        </div>
        <!-- end map & api details container-->
    </div>
    <!-- end demo container -->
</body>