/**
 * Ajax Queue Plugin
 *
 * By Robert Lynch
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 * Code inspired by the work of John Resig and Mike Hostetler.
 * Homepage: http://jquery.com/plugins/project/ajaxqueue
 * Documentation: http://docs.jquery.com/AjaxQueue
 *
 */


(function($) {
	$.ajaxQueue = function(ajaxOptions,queueName,queueMode){

		//set some first called vars
		if(typeof $document == 'undefined')
		{
			$document = $(document);
			window.ajaxQueueCount = {};
			window.ajaxSuccessCallbacks = {};
		}

		if(queueName == null)
		{
			queueName = "ajax";
		}

		if(queueMode == null)
		{
			queueMode = 'sync'; // default functionality is one at a time
		}

		queueName = queueName+queueMode;

		echoCon('adding to queue: '+queueName);

		if(typeof(ajaxQueueCount[queueName]) == 'undefined')
		{
			ajaxQueueCount[queueName] = 0;
			ajaxSuccessCallbacks[queueName] = {};
		}

		//this is the meat and potatoes of the function.  Has two modes, sync and async, though not in the same way that $.ajax means it.
		if(queueMode == 'sync')
		{
			//add the completion callback to the ajax so we run the next when done.
			ajaxOptions.complete = function(){
				ajaxQueueCount[queueName]--;
				$('#alx_connection').trigger('ajaxdown');
				$document.dequeue( queueName );
			};
			//add the new item to the queue
			ajaxQueueCount[queueName]++;
			$('#alx_connection').trigger('ajaxup');
			$document.queue(queueName, function(){
				$.ajax( ajaxOptions );
			});
			if(ajaxQueueCount[queueName] == 1)
			{
				$document.dequeue( queueName );
			}
		}
		else
		{
			//asynchronus server requests, sychronus callbacks
			ajaxQueueCount[queueName]++;
			var count = ajaxQueueCount[queueName];
			$('#alx_connection').trigger('ajaxup');
			if(ajaxSuccessCallbacks[queueName][count] == null)
			{
				ajaxSuccessCallbacks[queueName][count] = {};
			}
			//preserve the success callback for later execution
			ajaxSuccessCallbacks[queueName][ajaxQueueCount[queueName]].fn = ajaxOptions.success;
			//create a new success callback that will store the data returned
			ajaxOptions.success = function(data)
			{
				//when the call succeeds
				ajaxSuccessCallbacks[queueName][count].data = data;
				ajaxQueueCount[queueName]--;

				$('#alx_connection').trigger('ajaxdown');
				if(ajaxQueueCount[queueName] == 0)
				{
					for(var i in ajaxSuccessCallbacks[queueName])
					{
						var callbackObj = ajaxSuccessCallbacks[queueName][i];
						callbackObj.fn(callbackObj.data);
						ajaxSuccessCallbacks[queueName][i] = {};
					}
				}
			};
			$.ajax(ajaxOptions);
		}
	}


	//a wrapper for the connection dialog w/ std ajax calls
	$.ajaxRun = function(ajaxOptions){
		//add callback
		ajaxOptions.complete = function(){
			$('#alx_connection').trigger('ajaxdown');
		};
		//run ajax
		$('#alx_connection').trigger('ajaxup');
		return $.ajax( ajaxOptions );
	}
})(jQuery);
