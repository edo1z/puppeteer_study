const puppeteer = require('puppeteer')

const mapUrl = 'https://www.google.co.jp/maps/search/'
const keywords = '渋谷+整体'
const containerEl = '[data-result-index]'
const nameEl = 'h3 span'
const countEl = 'span.section-result-num-ratings'
const urlEl = 'button[data-section-id="ap"]'
const backBtnEl = 'button.section-back-to-list-button'

const main = async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto(mapUrl + keywords)
  const shops = await getShops(page)
  console.log(shops)
  await browser.close()
}

const getShops = async (page) => {
  await page.waitFor(containerEl, {timeout: 10000})
  const divLength = (await page.$$(containerEl)).length
  let shops = []
  let rank = 1
  for (let i = 0; i < divLength; i++) {
    const divs = await page.$$(containerEl)
    const shop = await getShop(page, divs[i], rank)
    if (shop) {
      shops.push(shop)
      rank++
    }
  }
  return shops
}

const getShop = async (page, div, rank) => {
  const name = await div.$eval(nameEl, name => name.innerText)
  const reviewCount = await div.$eval(countEl, count => count.innerText)
  console.log(name)
  const url = await getUrl(page, div)
  return {
    rank: rank,
    name: name,
    reviewCount: reviewCount.replace(/\((\d+?)\)/, '$1'),
    url: url
  }
}

const getUrl = async (page, div) => {
  div.click()
  await page.waitFor(backBtnEl, {timeout: 10000})
  const url = await page.$eval(urlEl,
    el => el.getAttribute('data-url')
  ).catch(() => null)
  console.log(url)
  page.click(backBtnEl)
  await page.waitFor(containerEl, {timeout: 10000})
  return url
}

main()
