var fixApiRefNav = function() {
    if ($('#the-nav li').length >= 22) {
        $('#the-nav').data('offset-bottom', '160');
    }
};

var fixDropDownMenuLargePosition = function() {
    setTimeout(function() {
        $('.dropdown-large').each(function() {
            var left = $(this).position().left;

            $(this).find('.dropdown-menu-large').css('left', left);
        });
    }, 100);
};

function getCompareDate() {
  var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('');
}

// fill demo pg request console with correct sample based on user's input
function fillWithSampleData() {
    const reqType = $('#req-type').val();
    const noAddress = $('input[type=radio][name=srcAddress]:checked').length = 0;

    let sampleData;
    if (noAddress) {
        return;
    } else if (reqType === "CURL") {
        const json = JSON.stringify(buildJSON(), null, 2)
        sampleData = `-X POST
-H 'Accept: application/json'
-H 'Authorization: Basic aHR0cHdhdGNoOmY='
-H 'Content-Type: application/json'
--data '${json}'
https://sandbox-rest.avatax.com/api/v2/transactions/create
        `;
    } else if (reqType === 'C#') {
        let lines = '';
        let address;
        const shipToAddress = setShipToOrSingleLocation();
        
        // gather all product info and make into SDK friendly form
        let lineNum = 1;
        const allProducts = $('input[type=checkbox][name=product]:checked');
        allProducts.each(function () {
            // Find amount
            const taxCode = $(this).val();
            //const description = $(this).attr('description');
            const amount = $('#' + $(this).attr('id') + '-amount').val();
            if (lineNum === allProducts.length) {
                lines += `new LineItemModel() 
                {
                    number = ${lineNum++},
                    quantity = 1,
                    amount = ${amount},
                    taxCode = ${taxCode},
                }`; 
            } else {
                lines += `new LineItemModel() 
                {
                    number = ${lineNum++},
                    quantity = 1,
                    amount = ${amount},
                    taxCode = ${taxCode},
                },`;
            }
        });

        // check if shipFrom/To addresses
        if(shipToAddress) {
            const shipTo = $('input[type=radio][name=srcAddress]:checked').val().split(',');
            const shipFrom = $('input[type=radio][name=address]:checked').val().split(',');
            
            // build C# req for multiple addresses
            address = `.WithAddress(TransactionAddressType.ShipFrom, ${shipTo[0]}, null, null, ${shipTo[1]}, ${shipTo[2]}, ${shipTo[4]}, ${shipTo[3]})
    .WithAddress(TransactionAddressType.ShipTo, ${shipFrom[0]}, null, null, ${shipFrom[1]}, ${shipFrom[2]}, ${shipFrom[4]}, ${shipFrom[3]})`;
        } else {
            const singleLocation = $('input[type=radio][name=address]:checked').val().split(',');

            // build C# req for single location
            address = `.WithAddress(TransactionAddressType.SingleLocation, ${singleLocation[0]}, null, null, ${singleLocation[1]}, ${singleLocation[2]}, ${singleLocation[4]}, ${singleLocation[3]})`;
        }

        // build sample data for c#
        sampleData = `// Create AvaTaxClient
var client = new AvaTaxClient("MyTestApp", "1.0", Environment.MachineName, AvaTaxEnvironment.Sandbox).WithSecurity("MyUsername", "MyPassword");

// Setup transaction model
var createModel = new CreateTransactionModel()
    ${address}
    ${lines}

// Create transaction
var transaction = client.CreateTransaction(null, createModel);
    `;
        
    }
    
    else {
        const json = JSON.stringify(buildJSON(), null, 2);
        sampleData = json;
    }

    $('#demo-console-input').empty().text(sampleData);
};

function makeAddressObj(){
    const address = $('input[type=radio][name=address]:checked').val().split(',');
    const addressObj = {
        "line1": address[0],
        "city": address[1],
        "region": address[2],
        "country": address[3],
        "postalCode": address[4],
    }
    return addressObj;
}

function makeSrcAddressObj(){
    const address = $('input[type=radio][name=srcAddress]:checked').val().split(',');
    const addressObj = {
        "line1": address[0],
        "city": address[1],
        "region": address[2],
        "country": address[3],
        "postalCode": address[4],
    }
    return addressObj;
}

function setShipToOrSingleLocation() {
    var checked = $('input[type=radio][name=srcAddress]:checked').length > 0;

    return checked;    
}

function buildJSON() {
    const address = makeAddressObj();
    const shipToAddress = setShipToOrSingleLocation();
    let sampleData;

    if(shipToAddress) {
        const srcAddress = makeSrcAddressObj();

        sampleData = {
            "lines": [],
            "type": "SalesOrder",
            "companyCode": "DEMOPAGE",
            "date": "2018-09-05",
            "customerCode": "ABC",
            "addresses": {
                "shipTo": address,
                "shipFrom": srcAddress,
            }
        };
    }
    else {
        sampleData = {
            "lines": [],
            "type": "SalesOrder",
            "companyCode": "DEMOPAGE",
            "date": "2018-09-05",
            "customerCode": "ABC",
            "addresses": {
                "singleLocation": address,
            }
        };
    }

    // Loop through all the checked products and add one line for each
    var lineNum = 1;
    $('input[type=checkbox][name=product]:checked').each(function () {
        // Find amount
        sampleData.lines.push({
            "number": lineNum++,
            "amount": $('#' + $(this).attr('id') + '-amount').val(),
            "taxCode": $(this).val(),
            "description": $(this).attr('description')
        });
    });

    return sampleData;
}

const proxy = {
    "route": "https://xp0wfn7roi.execute-api.us-west-2.amazonaws.com/production/proxy",
    "key": {
        "name": "api-key",
        "location": "v2-devdot-keys/devdot-proxy-key"
    }
}

function copyToClipboard(element) {
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
  }

function buildInfoboxHTML(body) {
    const summaryArray = body.summary;

    let infoboxHTML;

    let stateTax = 0.00; 
    let countyTax = 0.00; 
    let localTax = 0.00; 
    let specialTax = 0.00;          
    
    if (summaryArray.length > 0) {
        for(let i = 0; i < summaryArray.length; i++) {
            const item = summaryArray[i];
            switch (item.jurisType) {
                case 'State':
                    stateTax += item.taxCalculated;
                    break;
                case 'County':
                    countyTax += item.taxCalculated;
                    break;
                case 'Local':
                    localTax += item.taxCalculated;
                    break;
                case 'Special':
                    specialTax += item.taxCalculated;
                    break;
                default:
                    break;
            }
        };
    }
    
    infoboxHTML = `
        AvaTax's engine can calculate tax down to the roof-top level. In this case, 
        AvaTax returned a total tax of <span class="demo-tax-totals">$${body.totalTax.toFixed(2)}</span>, 
        which encompassed state <span class="demo-tax-totals">$${stateTax.toFixed(2)}</span>, 
        county <span class="demo-tax-totals">$${countyTax.toFixed(2)}</span>, 
        local <span class="demo-tax-totals">$${localTax.toFixed(2)}</span> 
        and special taxing districts <span class="demo-tax-totals">$${specialTax.toFixed(2)}</span>.
        Feel free to continue tinkering with the options to the left to test 
        the flexibility of the AvaTax API. Or, if you've seen enough, 
        <a href='https://developer.avalara.com/avatax/' target='_blank'>sign up for a 60-day API trial</a> 
        and production account.
    `;
    return infoboxHTML;
}

function ApiRequest() {
    // clear the console output/infobox and display loading-pulse
    $("#demo-console-output").empty();
    $(".loading-pulse").css('display', 'block');
    const infoboxNotHidden = !$('#demo-infobox').hasClass('hidden');
    if (infoboxNotHidden) {
        $("#demo-infobox-text").empty();
        $("#demo-infobox-header").html('Calculating...');
    }
    

    const data = buildJSON();
    const [bucket, key] = proxy.key.location.split('/');

    const keyBucket = new AWS.S3({params: {Bucket: bucket, Key: key}});
    return keyBucket.makeUnauthenticatedRequest('getObject', {}).promise()
    .then((bucketRes) => {
        return fetch(proxy.route, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                apiKey: bucketRes.Body.toString(),
                method: 'POST',
                route: 'https://sandbox-rest.avatax.com/api/v2/transactions/create?$include=summaryOnly',
                queryString: {},
                pathParams:{},
                postBody: data
            })
        })
        .then((rawApiResponse) => {
            return rawApiResponse.json().then((body) => {
                $(".loading-pulse").css('display', 'none');
                $('#demo-console-output').text(JSON.stringify(body, null, 2));
                
                if (infoboxNotHidden) {
                    $("#demo-infobox-header").html('Result');
                    const infoboxHTML = buildInfoboxHTML(body);
                    $("#demo-infobox-text").html(infoboxHTML);
                }
               
                //TODO handle errors
                // $('#console-output').text("HTTP Error: " + body.status + "\n\n" + JSON.stringify(result, null, 2));

                return {
                    status: rawApiResponse.status.toString(),
                    statusMessage: rawApiResponse.statusText,
                    body: body,
                };
            });
        });
    })
}

function hideInfobox() {
    $(".demo-infobox").css('display', 'none');
    $(".demo-infobox").addClass('hidden');
}

function accordionTrigger(currentElementId, nextElementId) {
    // get accordion elements
    var currentElement = document.getElementById(currentElementId);
    var nextElement = document.getElementById(nextElementId);

    // toggle active class on elements
    currentElement.classList.toggle("active");
    nextElement.classList.toggle("active");

    var panels = [currentElement.nextElementSibling, nextElement.nextElementSibling];

    // toggle display on panels
    panels.forEach(panel => {
        if (panel.style.display === "block") {
            panel.style.display = "none";
        } else {
            panel.style.display = "block";
        }
    })

}

$(document).ready(function() {
    fixApiRefNav();
    fixDropDownMenuLargePosition();

    var sections = document.getElementsByClassName("accordion");
    for (let i = 0; i < sections.length; i++) {
        sections[i].addEventListener("click", function() {
            // Toggle between adding and removing the "active" class,
            // to highlight the button that controls the panel
            this.classList.toggle("active");

            // Toggle between hiding and showing the active panel
            var panel = this.nextElementSibling;
            if (panel.style.display === "block") {
                panel.style.display = "none";
            } else {
                panel.style.display = "block";
            }
        });
    }

    $('[webinar-hide-before]').each(function() {
      if ($(this).attr('webinar-hide-before') <= getCompareDate()) {
        $(this).show();
      }
    });

    $('[webinar-hide-after]').each(function() {
      if ($(this).attr('webinar-hide-after') >= getCompareDate()) {
        $(this).show();
      }
    });

    // When we show the section nav on xs/sm, clear the main content below the nav
    $('.sm-section-nav').on('shown.bs.dropdown', function() {
        $('main').addClass('section-nav-open');
    });
    // When we hide the section nav on xs/sm, reset the main content next to the nav
    $('.sm-section-nav').on('hidden.bs.dropdown', function() {
        $('main').removeClass('section-nav-open');
    });

    //When the destination changes, fire the map script and set the lat-long.
    $('#dropdown-dest-addresses').change(function(e){
        const lat = $('input[type=radio][name=address]:checked').attr('lat');
        const long = $('input[type=radio][name=address]:checked').attr('long');
        const infoboxNotHidden = !$('.demo-infobox').hasClass('hidden');
        GetMapWithLine(lat, long, null, null, null, infoboxNotHidden);
    });

    //When the source changes, fire the map script with source and dest lat-long.
    $('#dropdown-src-addresses').change(function(e){
        const lat     = $('input[type=radio][name=address]:checked').attr('lat');
        const long    = $('input[type=radio][name=address]:checked').attr('long');
        const srcLat  = $('input[type=radio][name=srcAddress]:checked').attr('lat');
        const srcLong = $('input[type=radio][name=srcAddress]:checked').attr('long');

        // check if both address are in the US
        const addressType = $('input[type=radio][name=address]:checked').attr('addressType') === 'national';
        const srcType = $('input[type=radio][name=srcAddress]:checked').attr('addressType') === 'national';

        const usAddresses = addressType && srcType;

        const infoboxNotHidden = !$('.demo-infobox').hasClass('hidden');
        GetMapWithLine(lat, long, srcLat, srcLong, usAddresses, infoboxNotHidden);
    }); 

    $('#dropdown-addresses').trigger('change');
});
