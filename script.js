const IP = "127.0.0.1:3000"
let validHats = 0

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

// Obtains the list of unusual hats
async function server_unusuals_list() {
    let server_href = `http://${IP}/unusuals-list`
    let server_result = await fetch(server_href)
    let list_text = await server_result.json()
    unusuals_list_info(list_text)
}

// Obtains the page of unusual effects for a given hat type
async function server_unusual_effect(href) {
    let server_href = `http://${IP}/unusual-effect/${href}`
    let server_result = await fetch(server_href)
    let list_text = await server_result.json()
    //list_text is the HTML for a page of unusual effects
    scrapeUnusualsPage(list_text)
}

async function server_page_source(href){
    let server_href = `http://${IP}/page-source/${href}`
    let server_result = await fetch(server_href)
    let list_text = await server_result.json()
    //list_text is the HTML for a single page (unusual + hat)
    getSource(list_text)
}

async function unusuals_list_info(html) {
    //console.log(html)
    let backpack_tf = new DOMParser()
    let backpack_doc = backpack_tf.parseFromString(html, 'text/html')
    let unusual_pricelist = backpack_doc.querySelector('#unusual-pricelist')

    let debug = 0

    for (const child of unusual_pricelist.children) {
        let unusual_link = child.querySelector('a').getAttribute('href')
        let unusual_href = `https://backpack.tf${unusual_link}`
        let unusual_name = child.getAttribute('data-base_name')
        // Unusual_href is the link to the page with all the available effects for a hat
        server_unusual_effect(unusual_href)
        await sleep(2500)
    }
}

async function scrapeUnusualsPage(html) {

    let parser = new DOMParser()
    let doc = parser.parseFromString(html, 'text/html')

    let unusual_effects_container = doc.querySelector('.item-list.unusual-pricelist')
    
    if(unusual_effects_container === null || unusual_effects_container.children === null){
        console.log('Null value')
        return
    }

    for (const child of unusual_effects_container.children) {
        
        if(child === null){
            console.log('No children')
            return
        }

        let item_effect = child.getAttribute('data-effect_name')
        let item_name = child.getAttribute('data-name')
        let item_price_estimate = child.getAttribute('data-p_bptf')

        // Pulling attributes from HTML that are used in obtaining a link to stats page
        let url_effect = child.getAttribute('data-q_name')
        let url_base_name = child.getAttribute('data-name') // same as item_name, used for URL
        
        let url_tradable = ''
        if(child.getAttribute('data-tradable') == 1){
            url_tradable = 'Tradable'
        }else{
            url_tradable = 'Untradable' // UNSURE ABOUT FORMAT
        }

        let url_craftable = ''
        if(child.getAttribute('data-craftable') == 1){
            url_craftable = 'Craftable'
        }else{
            url_craftable = 'Uncraftable' // UNSURE ABOUT FORMAT
        }

        let url_num = child.getAttribute('data-priceindex')

        let item_url = `https://backpack.tf/stats/${url_effect}/${url_base_name}/${url_tradable}/${url_craftable}/${url_num}`
        item_url = item_url.replace(/\s/g, "%20")

        // Item_url is a link that points to an available effect for a hat
        // This is the page that we need to pull prices from (buy/sell)
    
        //console.log(item_url)
        validHats++
        server_page_source(item_url)
        await sleep(2500)
    }

}

async function getSource(html) {

    let sell_prices = []
    let buy_prices = []

    let parser = new DOMParser()
    let doc = parser.parseFromString(html, 'text/html')

    let name = doc.querySelector('.stats-header-title')
    if(name !== null && name.innerHTML !== null) name = name.innerHTML
        console.log(name)
    
    if(doc.querySelector("#subscribe-sell") !== null){

        let sell = doc.querySelector("#subscribe-sell").parentElement.parentElement
        
        let sell_listings = sell.querySelectorAll('.media-list .listing  .item')
        console.log('SELL')
        
        sell_listings.forEach(element => {
            //sell_prices.push(element.getAttribute('data-p_bptf'))
            sell_prices.push(element.getAttribute('data-p_bptf_all'))
            sell_prices.push(element.getAttribute('data-listing_price'))
        })

    }else{
        console.log(html)
    }
    
    if(doc.querySelector("#subscribe-buy") !== null){
        let buy = doc.querySelector("#subscribe-buy").parentElement.parentElement
        let buy_listings = buy.querySelectorAll('.media-list .listing  .item')
        
        buy_listings.forEach(element => {
            //buy_prices.push(element.getAttribute('data-p_bptf'))
            buy_prices.push(element.getAttribute('data-p_bptf_all')) 
            buy_prices.push(element.getAttribute('data-listing_price'))
        })
    }


    /*  ALGORITHM RUNS HERE  */

    if(1){  // ! Replace with conditional from algorithm!!!

        /* Get icon */

        let item_icon = doc.querySelector('.item-icon')
        let item_icon_style = item_icon.getAttribute('style')
        let url_separator = item_icon_style.split(',')
        let hat_icon_url = url_separator[0].replace('background-image:url(', '').replace(')', '')
        console.log(hat_icon_url)
        let effect_icon_url = 'https://backpack.tf' + url_separator[1].replace('url(', '').replace(')', '')
        console.log(effect_icon_url)

        /* Add element to page */

        const flips_table = document.querySelector('.flips-table')
        const li = document.createElement('li')
        li.classList.add('table-element')
        li.setAttribute('style', `background-image: url(${hat_icon_url}),url(${effect_icon_url})`)

        flips_table.appendChild(li)

        li.addEventListener('click', () => {
            //revealing popup section
            const popup = document.querySelector('.item-info')
            popup.classList.remove('hidden')
            //assigning the name of the item to the popup title
            let item_name = popup.querySelector('h2')
            item_name.innerHTML = name
            //getting the buy and sell lists
            let sell_list = popup.querySelector('#sell')
            let buy_list = popup.querySelector('#buy')
            //clear the lists
            sell_list.replaceChildren()
            buy_list.replaceChildren()

            //populating the lists

            sell_prices.forEach(element => {
                if(element !== null){
                    let sell_li = document.createElement('li')
                    sell_li.innerHTML = element
                    sell_list.appendChild(sell_li)
                }
            })

            buy_prices.forEach(element => {
                if(element !== null){
                    let buy_li = document.createElement('li')
                    buy_li.innerHTML = element
                    buy_list.appendChild(buy_li)
                }
            })
            

        })

    }


}




function main() {   
    //call function to start process
    server_unusuals_list()

}

main()