/// <reference path="ko.js" />
/// <reference path="Jquery.js" />


//http://localhost:1949/
//https://api.github.com/repos/knockout/knockout/stargazers
//https://api.github.com/repos/appcelerator/titanium_mobile/stargazers
var userModel = function () {

    //extra field

}

var homeViewModel = function () {
    var self = this;

    self.Users = ko.observableArray([]);
    self.TotalCount = ko.observable(0);
    self.LocationText = ko.observable('');
    self.LanguageText = ko.observable('');

    //Local Storage
    self.UserDetails = ko.observableArray([]);
    self.ShortList = ko.observableArray([]);

    self.isShortListed = function(id)
    {
        return self.ShortList().indexOf(id) > 0;
    }
    //action

    //State
    self.isShowDetails = ko.observable(false);

    //Page
    self.PageNo = ko.observable(1);
    self.ItemPerPage = ko.observable(100);
    self.Pages = ko.pureComputed(function () {
        var pages = [], p = Math.ceil(self.TotalCount() / self.ItemPerPage());

        for (var i = 1; i <= p; i++) {
            pages.push(i);
        }

        return pages;
    });

    self.SearchClick = function (data, e) {
        var options = {
            data: {
                page: self.PageNo(),
                per_page: self.ItemPerPage
            }
        };

        //hack way
        var q = 'q=+location:"' + encodeURIComponent(self.LocationText()) + '"';
        if (self.LanguageText()) {
            q += '+language:"' + encodeURIComponent(self.LanguageText()) + '"';
        }
        $.ajax('https://api.github.com/search/users?' + q, options).done(function (data) {
            self.Users(data.items);
            self.TotalCount(data.total_count);
        });

        self.isShowDetails(false);

    }

    self.PageClick = function (data, e) {
        self.PageNo(data);
        self.SearchClick();
    }

    self.ShortListClick = function(data,e)
    {
        var index = self.ShortList().indexOf(data.id);
        if (index >= 0)
        {
            self.ShortList.splice(index, 1);
        }
        else
        {
            self.ShortList.push(data.id);

            $.ajax(data.url, {}).done(function (d) {

                self.UserDetails.push(d);
                // Put the object into storage
                localStorage.setItem('HRWeb_UserDetails', JSON.stringify(self.UserDetails()));
            });
        }

        // Put the object into storage
        localStorage.setItem('HRWeb', JSON.stringify(self.ShortList()));

    }

    self.LanguageClick = function(data,e)
    {
        var text = $(e.target).closest('li').text();
        self.LanguageText(text);
    }

    self.showUserDetailsClick = function(date,e)
    {
        self.isShowDetails(true);
    }

    self.removeUserDetailsClick = function(data,e)
    {
        var o = ko.utils.arrayFirst(self.UserDetails(), function (item) {
            return item.id == data.id;
        });

        self.UserDetails.remove(o);

        self.ShortList().splice(data.id, 1);

        localStorage.setItem('HRWeb_UserDetails', JSON.stringify(self.UserDetails()));
        localStorage.setItem('HRWeb', JSON.stringify(self.ShortList()));

    }

    self.deleteAllShorListedClick = function(data,e)
    {
        localStorage.setItem('HRWeb_UserDetails', JSON.stringify([]));
        localStorage.setItem('HRWeb', JSON.stringify([]));
    }
}

var _homeViewModel = new homeViewModel();

$(document).ready(function () {

    ko.applyBindings(_homeViewModel, $('body').get(0));

    //

    // Retrieve the object from storage
    var retrievedObject = localStorage.getItem('HRWeb');
    var retrievedObject_1 = localStorage.getItem('HRWeb_UserDetails');
    if (retrievedObject)
    {
        _homeViewModel.ShortList(JSON.parse(retrievedObject));
    }

    if (retrievedObject_1) {
        _homeViewModel.UserDetails(JSON.parse(retrievedObject_1));
    }
});