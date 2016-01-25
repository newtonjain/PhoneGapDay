describe('Pheedback App', function() {  
    beforeEach(function() {
      browser.get('http://localhost:8100/app.html#/tab/account');
    });

    describe('Facebook Auth Login', function() {
        it('should correctly mock the FB login behaviour', function() {
            var loginButton = element(by.id("login")),
                viewport = element(by.id("viewport"));
        
            browser.driver.sleep(700);
            loginButton.click();
            
            // validate that the viewport is not null.
            expect(viewport).not.toBe(null);
        })
    })
   
    describe('Account Tab', function() {
        it('should have the correct title', function() {
           expect(browser.getTitle()).toEqual('Account');
        });

        it('should have no authData without authentication', function() {
            var auth = element(by.binding('authData'));
            expect(auth.getText()).toBe(''); 
        });
    })
});