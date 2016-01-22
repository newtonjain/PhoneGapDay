describe('Define your Suite', function() {  
 
    it('Define your Spec', function() {
        // wait for the splash screen.
        browser.driver.sleep(7000);
        
        var loginButton = element(by.id("login"));
        loginButton.click();
    })
});