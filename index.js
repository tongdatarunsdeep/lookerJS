looker.plugins.visualizations.add({
	create: function(element, config){
	},
	updateAsync: function(data, element, config, queryResponse, details, doneRendering){
        const hasCountry = data[0]['sem_seasonal_pacing.campaign_country_code'];
        const defaultValue = 0;
        const metrics = [
            {name:'spend',displayName:'Spend',flagNegative:'neg-green',flagPositive:'pos-red',index:0},
            {name:'pro_trials',displayName:'Trials',flagNegative:'neg-red',flagPositive:'pos-green',rowCSS:'non_currency',index:1},
            {name:'cost_per_trial',displayName:'CPT',flagNegative:'neg-green',flagPositive:'pos-red',index:2},
            {name:'estimated_revenue',displayName:'Revenue',flagNegative:'neg-red',flagPositive:'pos-green',index:3},
            {name:'return_on_investment',displayName:'ROI',flagNegative:'neg-red',flagPositive:'pos-green',rowCSS:'number_percentage',index:4},
            {name:'new_actives',
            displayName:'New Actives',flagNegative:'neg-red',flagPositive:'pos-green',
            rowCSS:'non_currency',index:5}
        ];
        function findRowIndex(rowName){
            return metrics.find(x=>x.name === rowName).index;

        }
        const spendIndex = findRowIndex('spend');
        const trialsIndex =findRowIndex('pro_trials');
        const cptIndex = findRowIndex('cost_per_trial');
        const revenueIndex = findRowIndex('estimated_revenue');
        const roiIndex = findRowIndex('return_on_investment');
        const newActivesIndex = findRowIndex('new_actives');

        const headerDisplayDifferentName = {
            'fixed': ' ',
        };
        const channelDisplayDifferentName = {
            ' all': 'SEM ALL',
            '_unbranded all': 'SEMu ALL',
            '_branded all': 'SEMb ALL',
            'google all': 'GOOGLE SEM ALL',
            'google_sem_unbranded':'GOOGLE SEMu',
            'google_sem_branded':'GOOGLE SEMb',
            'bing all': 'BING SEM ALL',
            'bing_sem_unbranded':'BING SEMu',
            'bing_sem_branded':'BING SEMb',
            'yahoo all': 'YAHOO SEM ALL',
            'yahoo_sem_unbranded':'YAHOO SEMu',
            'yahoo_sem_branded':'YAHOO SEMb',
            'undefined':'',
            'zznot set':'Not Set'
        };
        const tableSchema = [        
            {
                column: 'sem_seasonal_pacing.campaign_channel',
                columnDisplayName: 'Campaign Channel',
                classNameCSS: 'dis_fixed',
                columnSection: 'fixed'
            },
            {
                column: 'metric',
                columnDisplayName: 'Metric',
                classNameCSS: 'dis_metric',
                columnSection: 'fixed'
            },
            {
                column: 'sem_seasonal_pacing.total_$',
                columnDisplayName: 'Actuals',
                classNameCSS: 'number_total',
                columnSection: 'Season to Date (Cumulative)'
            },
            {
                column: 'sem_seasonal_pacing.std_$_to_std_target_percentage',
                columnDisplayName: '% to target (STD)',
                classNameCSS: 'number_percentage',
                columnSection: 'Season to Date (Cumulative)'
            },
            {
                column: 'sem_seasonal_pacing.std_$_to_std_target_absolute',
                columnDisplayName: 'Variance (STD)',
                classNameCSS: 'number_total',
                columnSection: 'Season to Date (Cumulative)'
            },
            {
                column: 'sem_seasonal_pacing.std_$_to_eos_target_percentage',
                columnDisplayName: '% to target (EoS)',
                classNameCSS: 'number_percentage',
                columnSection: 'Season to Date (Cumulative)'
            },
            {
                column: 'sem_seasonal_pacing.std_$_to_eos_target_absolute',
                columnDisplayName: 'Variance (EoS)',
                classNameCSS: 'number_total',
                columnSection: 'Season to Date (Cumulative)'
            },
            {
                column: 'sem_seasonal_pacing.pacing_$_to_eos_target_percentage',
                columnDisplayName: '% to target (EoS)',
                classNameCSS: 'number_percentage',
                columnSection: 'Pacing Variance (End of Season)'
            },
            {
                column: 'sem_seasonal_pacing.pacing_$_to_eos_target_absolute',
                columnDisplayName: 'Variance (EoS)',
                classNameCSS: 'number_total',
                columnSection: 'Pacing Variance (End of Season)'
            },            
            {
                column: 'sem_seasonal_pacing.total_std_$_target',
                columnDisplayName: 'total_std_$_target',
                classNameCSS: 'dis_hide',
                columnSection: 'hide'
            },
            {
                column: 'sem_seasonal_pacing.total_$_target',
                columnDisplayName: 'total_$_target',
                classNameCSS: 'dis_hide',
                columnSection: 'hide'
            },
            {
                column: 'sem_seasonal_pacing.total_projected_$',
                columnDisplayName: 'total_projected_$',
                classNameCSS: 'dis_hide',
                columnSection: 'hide'
            }
        ];
        //check if country column is added
        if(hasCountry){
            tableSchema.splice(1,0,{
                column: 'sem_seasonal_pacing.campaign_country_code',
                columnDisplayName: 'Country',
                classNameCSS: 'dis_fixed',
                columnSection: 'fixed'
            })
        }


        //fixed columns: campaign channel, metric and actuals
        const fixedColumns = tableSchema.filter(x=>x.columnSection == 'fixed').length + 1;
        const displayColumns = tableSchema.filter(x=>x.columnSection != 'hide').length;
        

        // <style> section.
        // define the background color for the first two columns, based on brand
        const brandColor = {
            'google': {'background':'#00c4cc','color':'white','metric_color':'#00c4cc'},
            'bing': {'background':'#bbc1c4','color':'black','metric_color':'black'},
            'yahoo': {'background':'#d9d2e9','color':'black','metric_color':'black'}
        };
        // base CSS for table font 
        let styleHTML= `<style>   
        table {
            table-layout: fixed ;
            border-radius: 5px;
            font-size: 12px;
            font-weight: normal;
            border: none;
            border-collapse: collapse;
            width: 100%;
            max-width: 100%;
            word-wrap: break-word;
            color: rgb(95, 95, 95);
            font-family:Arial;
        }           
        td,th {
            word-wrap: break-word;
            font-size: 16px;
        }           
        td {
            padding-left: 0.3%;
            padding-right: 0.3%;
            padding-top: 0.1%;
            padding-bottom: 0.1%;
            border-right: 2px solid #f8f8f8;
            font-size: 12px;
            width: 10%;
            border: 1px solid #d1d1e0;
        }
        th {            background: #676e74;
            border: 1px solid rgb(95, 95, 95);
            color: white;
            padding: 3px;
        }
        .main {
            background: #033d68;
            border: 2px solid rgba(120, 120, 120, 0.3);
            color: white;
            font-size: 16px;
            font-weight: bold;
        }

        .neg-red,.pos-red {
            color:red;    
                    
        }
        .neg-green,.pos-green {
            color:green;
        }
        .dis_metric {
            color: #033d68;
            font-size: 14px;
            font-weight: bold;
        }
        .number_total,.number_percentage,.non_currency{
            text-align: center; 
        }
        `
        // adding CSS to HTML for different background for each row    
        styleHTML += ".wrap:nth-child(even) {background-color: #f2f2f2;}";
        styleHTML += ".dis_metric {background: white;}"

        // adding CSS to HTML for background color ofthe first two columns, based on brand
        for (let brand in brandColor) {
            styleHTML += `.${brand}.main {background:${brandColor[brand]['background']};color:${brandColor[brand]['color']};}`;
            styleHTML += `.${brand}.dis_metric {color:${brandColor[brand]['metric_color']};}`;
        }          
        styleHTML += `</style>`;
        element.innerHTML = styleHTML;
        
        
        // find all column sections defined in table schema and to create the top header row
        let columnSections = tableSchema.map(x=>x.columnSection).filter((v, i, a) => a.indexOf(v) === i);
        let extraHeader = new Object();
        columnSections.forEach(section => {
            if(section !=='hide'){extraHeader[section] = tableSchema.filter( row => row.columnSection == section).length;}
        });
        let html = "<table><tr>"; 
        for (let section in extraHeader){
            html += `<th colspan="${extraHeader[section]}">${headerDisplayDifferentName[section]?headerDisplayDifferentName[section]:section}</th>`;
        }
        html += "</tr></tr>"

        //create the second header row
        tableSchema.forEach( x => { 
            if(x.columnSection !=='hide'){
                html += `<th>${x.columnDisplayName}</th>` }
            })
        html += "</tr></br>";
        
        // find all columns except campain soure, campain channel and metric, calculate their values based on data object returned by looker
        let dynamicColumns = tableSchema.filter(x => x.columnSection !== 'fixed').map(x=>x.column);
        let rows = [];
        for(let a in data){
            let obj = data[a];      
            // let source = obj[tableSchema[0].column].value;
            let channel = obj[tableSchema[0].column].value;
            let country;
            if(hasCountry){
                country = obj[tableSchema[1].column].value;
            }
            let returnValues = [];
            for (let i in metrics){
                returnValues[i] = {};
                // returnValues[i]['sem_seasonal_pacing.campaign_source'] = source;
                returnValues[i]['sem_seasonal_pacing.campaign_channel'] = channel;
                returnValues[i]['sem_seasonal_pacing.campaign_country_code'] = country?country:'zznot set';
                returnValues[i]['metric'] = metrics[i].displayName;
                returnValues[i]['metric_full'] = metrics[i].name;
                for(let j in dynamicColumns){
                    // let key = dynamicColumns[j].replace('$',metrics[i].name);
                    let key = dynamicColumns[j].replace('$',metrics[i].name);
                    let value = Object.keys(obj).indexOf(key) >= 0 ? obj[key].value : defaultValue;
                    returnValues[i][dynamicColumns[j].replace('_$','')] = value;
                }
            }
            rows = rows.concat(returnValues); 
        }  
        //calculate the total and rearrange rows here
        function getSubRows(brand){
            let subRows = rows.filter(x=>x['sem_seasonal_pacing.campaign_channel'].indexOf(brand)>=0);
            let returnSubValues = [];
            function returnSubRows (brand,index, calIndex1,calIndex2){
                return {
                    'sem_seasonal_pacing.campaign_channel': brand+ ' all',
                    'metric': metrics[index].displayName,
                    'metric_full': metrics[index].name,
                    'sem_seasonal_pacing.total': returnSubValues[calIndex1]['sem_seasonal_pacing.total'] /returnSubValues[calIndex2]['sem_seasonal_pacing.total'],
                    'sem_seasonal_pacing.total_std_target': returnSubValues[calIndex1]['sem_seasonal_pacing.total_std_target'] /returnSubValues[calIndex2]['sem_seasonal_pacing.total_std_target'],
                    'sem_seasonal_pacing.total_target': returnSubValues[calIndex1]['sem_seasonal_pacing.total_target'] /returnSubValues[calIndex2]['sem_seasonal_pacing.total_target'],
                    'sem_seasonal_pacing.total_projected': returnSubValues[calIndex1]['sem_seasonal_pacing.total_projected'] /returnSubValues[calIndex2]['sem_seasonal_pacing.total_projected'],
                    'sem_seasonal_pacing.std_to_std_target_percentage':returnSubValues[calIndex1]['sem_seasonal_pacing.std_to_std_target_percentage'] /returnSubValues[calIndex2]['sem_seasonal_pacing.std_to_std_target_percentage'],
                    'sem_seasonal_pacing.std_to_std_target_absolute':(returnSubValues[calIndex1]['sem_seasonal_pacing.total'] /returnSubValues[calIndex2]['sem_seasonal_pacing.total']) - (returnSubValues[calIndex1]['sem_seasonal_pacing.total_std_target']/returnSubValues[calIndex2]['sem_seasonal_pacing.total_std_target']),
                    'sem_seasonal_pacing.std_to_eos_target_percentage':returnSubValues[calIndex1]['sem_seasonal_pacing.std_to_eos_target_percentage'] /returnSubValues[calIndex2]['sem_seasonal_pacing.std_to_eos_target_percentage'],
                    'sem_seasonal_pacing.std_to_eos_target_absolute':(returnSubValues[calIndex1]['sem_seasonal_pacing.total'] /returnSubValues[calIndex2]['sem_seasonal_pacing.total']) - (returnSubValues[calIndex1]['sem_seasonal_pacing.total_target']/returnSubValues[calIndex2]['sem_seasonal_pacing.total_target']),
                    'sem_seasonal_pacing.pacing_to_eos_target_percentage':returnSubValues[calIndex1]['sem_seasonal_pacing.pacing_to_eos_target_percentage'] /returnSubValues[calIndex2]['sem_seasonal_pacing.pacing_to_eos_target_percentage'],
                    'sem_seasonal_pacing.pacing_to_eos_target_absolute':(returnSubValues[calIndex1]['sem_seasonal_pacing.total_projected'] /returnSubValues[calIndex2]['sem_seasonal_pacing.total_projected']) - (returnSubValues[calIndex1]['sem_seasonal_pacing.total_target']/returnSubValues[calIndex2]['sem_seasonal_pacing.total_target'])
 
                }
            }
            for (let i in metrics){
                if(i != cptIndex && i != roiIndex){
                    let brandMetricSub = subRows.filter(x=> x.metric === metrics[i].displayName);
                    let total = brandMetricSub.map(x => x['sem_seasonal_pacing.total']).reduce((a,b)=>a+b,0);
                    let total_std_target = brandMetricSub.map(x => x['sem_seasonal_pacing.total_std_target']).reduce((a,b)=>a+b,0);
                    let total_target = brandMetricSub.map(x => x['sem_seasonal_pacing.total_target']).reduce((a,b)=>a+b,0);
                    let total_projected = brandMetricSub.map(x => x['sem_seasonal_pacing.total_projected']).reduce((a,b)=>a+b,0);
                    returnSubValues[i] = {
                        'sem_seasonal_pacing.campaign_channel': brand + ' all',
                        'metric': metrics[i].displayName,
                        'metric_full': metrics[i].name,
                        'sem_seasonal_pacing.total': total,
                        'sem_seasonal_pacing.total_std_target': total_std_target,
                        'sem_seasonal_pacing.total_target': total_target,
                        'sem_seasonal_pacing.total_projected': total_projected,
                        'sem_seasonal_pacing.std_to_std_target_percentage':total/total_std_target,
                        'sem_seasonal_pacing.std_to_std_target_absolute':total-total_std_target,
                        'sem_seasonal_pacing.std_to_eos_target_percentage':total / total_target,
                        'sem_seasonal_pacing.std_to_eos_target_absolute':total - total_target,
                        'sem_seasonal_pacing.pacing_to_eos_target_percentage':total_projected / total_target,
                        'sem_seasonal_pacing.pacing_to_eos_target_absolute':total_projected - total_target
                    };
                    if(hasCountry){
                        returnSubValues[i]['sem_seasonal_pacing.campaign_country_code'] ='Total';
                    } 
                } else if(i == cptIndex){
                    returnSubValues[i] = returnSubRows (brand,i,spendIndex,trialsIndex)
                } else if(i == roiIndex ){
                    returnSubValues[i] = returnSubRows (brand,i,revenueIndex,spendIndex)
                } 
       
            }
            return returnSubValues;
        }
        function filterRows(term){
            let newRows = rows.filter( x => x['sem_seasonal_pacing.campaign_channel'] == term);
            return  newRows.sort((a, b)=>{
                return a['sem_seasonal_pacing.campaign_country_code'].localeCompare(b['sem_seasonal_pacing.campaign_country_code']) 
            })
        }
        let newRows = getSubRows('')
        newRows = newRows.concat(getSubRows('_unbranded'))
        newRows = newRows.concat(getSubRows('_branded'))

        newRows = newRows.concat(getSubRows('google'))
        newRows = newRows.concat(filterRows("google_sem_unbranded"))
        newRows = newRows.concat(filterRows("google_sem_branded"))

        newRows = newRows.concat(getSubRows('bing'))
        newRows = newRows.concat(filterRows("bing_sem_unbranded"))
        newRows = newRows.concat(filterRows("bing_sem_branded"))

        // newRows = newRows.concat(getSubRows('yahoo'))
        // newRows = newRows.concat(filterRows("yahoo_sem_unbranded"))
        // newRows = newRows.concat(filterRows("yahoo_sem_branded"))
        function formatNumber(number,type,rowCSS){
            if(typeof number ==='number' && isNaN(number)){
                number = 0;
            }
            if(type === 'number_percentage'){
                return parseFloat(number * 100).toFixed(2) + '%';
            }
            if(type === 'number_total'){
                let absNumber = Math.abs(number);
                let neg = Number(number) < 0 ? '-':'' 
                if (rowCSS !== 'non_currency') {
                    neg += '$';
                }
                if( absNumber >= 1000000){
                    return neg + parseFloat(absNumber / 1000000).toFixed(2) + 'M';
                } else if(absNumber >= 1000){
                    return neg + parseFloat(absNumber / 1000).toFixed(2) + 'K';
                } else {
                    return neg + parseFloat(absNumber).toFixed(2)
                }
            }
            return number
        }

        newRows.forEach((row,rowIndex) => {
            let metricIndex = rowIndex % metrics.length;
            html += "<tr class='wrap'>";
            let rowCSS = metrics[metricIndex].rowCSS;          
            tableSchema.forEach( (x, index) => {           
                let field = x.column.replace('_$','');
                let className = x.classNameCSS;
                let brand = Object.keys(brandColor).filter( brand => row['sem_seasonal_pacing.campaign_channel'].indexOf(brand) > -1); 
                if(className.indexOf('number') >= 0 && rowCSS && rowCSS.indexOf('number') >= 0){
                    className = rowCSS;
                }
                if(index < fixedColumns - 2 ){
                    if(metricIndex === 0){
                        html += `<td rowspan="${metrics.length}" class="main ${brand} ${className}`;
                        let cell = row[field]?row[field]:'';
                        if(channelDisplayDifferentName[cell]){
                            cell = channelDisplayDifferentName[cell];
                        }
                        html += `">${cell}</td>`;
                    }                        
                } else if(index < fixedColumns ){
                    html += `<td class="${className}`;
                    if(index == 1){
                        html  += ` ${brand}`;
                    }
                    html += `">${formatNumber(row[field],className,rowCSS)}</td>`; 
                } else if(index < displayColumns){
                    html += `<td class="${className}`
                    if(Number(row[field]) !== 0 && !isNaN(Number(row[field]))){
                        if( ((x.classNameCSS == 'number_total' && Number(row[field]) < 0)||(x.classNameCSS == 'number_percentage' && Number(row[field]) < 1)) && metrics[metricIndex].flagNegative){
                            html += ` ${metrics[metricIndex].flagNegative}`;
                        } else {
                            html += ` ${metrics[metricIndex].flagPositive}`;
                        }
                    }
                    html += `">${formatNumber(row[field],className,rowCSS)}</td>`;                                            
                }                                
            })
            html += "</tr>";
        })
        html += "</table>";
        element.innerHTML += html;
		doneRendering();
    }
});

