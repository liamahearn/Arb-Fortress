const os = require('os')
const http = require('http')

const hostname = '127.0.0.1'
const port = 3000

async function latest_changes_list() {
    const response = await fetch('https://backpack.tf/')
    console.log('Got response from https://backpack.tf/')
    data = await response.text()
    return data //HTML contents
}

async function unusuals_list() {
    const response = await fetch('https://backpack.tf/unusuals/')
    console.log('Got response from https://backpack.tf/unusuals/')
    data = await response.text()
    return data //HTML contents
}

async function unusual_effect(path) {
    split_path = path.split('/unusual-effect/')
    const response = await fetch(split_path[1])
    console.log(`Got unusual effects from ${split_path[1]}`)
    data = await response.text()
    return data //HTML contents
}

async function page_source(path){
    split_path = path.split('/page-source/')
    const response = await fetch(split_path[1])
    console.log(`Got page source from ${split_path[1]}`)
    data = await response.text()
    return data //HTML contents
}

const serverMethods = {
    '/latest-changes-list': latest_changes_list,
    '/unusuals-list': unusuals_list,
    '/unusual-effect': unusual_effect,
    '/page-source': page_source,
}

async function listener(req, res) {
    const url = new URL(req.url, `http://${req.headers.host}`)
    let data = 0
    for(const entry of Object.entries(serverMethods)){
        console.log('Searching server methods for match...')
        const fullPath = url.pathname
        const path = entry[0]
        if(url.pathname.startsWith(path)){
            console.log(`Found match for pathname ${fullPath}`)
            if(serverMethods[path]){
                console.log(serverMethods[path])
                data = await serverMethods[path](fullPath)
                res.statusCode = 200
                res.setHeader('Content-Type', 'application/json')
                res.setHeader('Access-Control-Allow-Origin', '*')
                return res.end(JSON.stringify(data))
            }
        }        
    }
    console.error("Whoops! Couldn't find a function of that name!")
    res.statusCode = 400
    return res.end()
}
const server = http.createServer(listener)

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
})