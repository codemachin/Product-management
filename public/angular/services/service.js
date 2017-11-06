myApp.service('productService', function($http){

	var baseUrl = "./api/v1"
	
	

	this.getAllProduct = function(){

		return $http.get(baseUrl+'/product/all')

	} // gets all products

	this.getAllLot = function(){

		return $http.get(baseUrl+'/product/allLot')

	} // get all lots

	this.editProduct = function(id,data){

		return $http.put(baseUrl+'/product/'+id+'/edit',data)

	} // edit single product
	
	this.deleteProduct = function (id){
		return $http.post(baseUrl+'/product/'+id+'/delete', null)
	} // api for deleting a product




});