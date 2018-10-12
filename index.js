const puppeteer = require("puppeteer");
const { step, action, pending } = require("prescript");
const delay = require("delay");

function getPage(state) {
  /** @type {import('puppeteer').Page} */
  const page = state.page;
  return page;
}

async function retry(f, n = 3) {
  let error;
  for (let i = 0; i < n; i++) {
    try {
      return await f();
    } catch (e) {
      error = e;
    }
  }
  throw error;
}

step("Open browser", () =>
  action(async state => {
    state.browser = await puppeteer.launch({
    //  headless: false
    });
  })
);

step("Go to chilindo.com", () =>
  action(async state => {
    /** @type {import('puppeteer').Browser} */
    const browser = state.browser;
    const page = await browser.newPage();
    const config = JSON.parse(
      require("fs").readFileSync(".login.json", "utf8")
    );
    const url = config.pramool;
    await retry(async () => {
      await page.goto(url, {
        timeout: 10000
      });
      state.page = page;
    });
  })
);

step("click country", () =>
  action(async state => {
    const page = getPage(state);
    try {
      await retry(async () => {
        await page.click('li[lang="th"]');
        await page.click("a.country-btn");
      });
    } catch (e) {}
  })
);

step("click login manual", () =>
  action(async state => {
    const page = getPage(state);
    await delay(2000);
    await retry(async () => {
      await page.waitForSelector(
        "div#Signin1_pnlLoginModals.register_sign.signlogin_popup",
        {
          timeout: 5000,
          visible: true
        }
      );
      await page.click("a#mutedlogin.muted");
      await page.click("a#mutedlogin.muted");
    });
    // await retry(async () => {

    // });
    // await page.type('input[name="password"]', password)
    // });
  })
);

step("login", () => {
  action(async state => {
    const page = getPage(state);
    const config = JSON.parse(
      require("fs").readFileSync(".login.json", "utf8")
    );
    await delay(1000)
    const email = config.email;
    const password = config.password;
    const url = config.pramool;
    await page.type('input[name="ctl00$Signin1$txtEmail"]', email);
    await page.type('input[name="ctl00$Signin1$txtPassword"]', password);
    await page.click("input#Signin1_btnSignIn");
    await delay(1000)
    await retry(async () => {
      await page.goto(url);
    });
  });
});

step("input price bid", () => {
  action(async state => {
    const page = getPage(state);
    const config = JSON.parse(
      require("fs").readFileSync(".login.json", "utf8")
    );
    const maxBid = config.maxBid;
    const url = config.pramool;
    await delay(1000);
    await page.evaluate(() => {
      document.querySelector("input#ContentPlaceHolder1_txtBidNew").value = "";
    });
    //await page.type('input[name="ctl00$ContentPlaceHolder1$txtBidNew"]','')
    await page.type(
      'input[name="ctl00$ContentPlaceHolder1$txtBidNew"]',
      maxBid
    );
    await page.click("a#ContentPlaceHolder1_btnBid");
  });
});

step('Close browser', () =>
  action(async state => {
    await delay(3000);
    /** @type {import('puppeteer').Browser} */
    const browser = state.browser
    browser.close()
  })
)
