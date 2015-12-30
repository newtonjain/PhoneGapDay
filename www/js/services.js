angular.module('starter.services', [])

.factory("Items", function($firebaseArray) {
  var itemsRef = new Firebase("https://poll2roll.firebaseio.com/");
  return $firebaseArray(itemsRef);
})

.factory("Auth", function($firebaseAuth) {
  var usersRef = new Firebase("https://poll2roll.firebaseio.com/users");
  return $firebaseAuth(usersRef);
})