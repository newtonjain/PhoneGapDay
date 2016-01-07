angular.module('starter.services', [])

.factory("Auth", function($firebaseAuth) {
  var usersRef = new Firebase("https://poll2roll.firebaseio.com/users");
  return $firebaseAuth(usersRef);
})