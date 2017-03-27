/**
 * Created by thangnv on 3/24/2017.
 */

/**
 * xeca api module
 * @type {string}
 */
var xecaApiUrl = '/xeca-api';

function init() {
	$('.page-loader').toggle();
	$('.date-time-picker').datetimepicker();
}

/**
 * Đổ dữ liệu thông tin tài khoản
 * @param info
 */
function bindingBalanceInfo(info) {
	$('input[name=phone-number]').val(info.mobile);
	$('input[name=name]').val(info.name);
	$('input[name=email]').val(info.email);
	$('input[name=pin]').val(info.identityNo);
	$('input[name=birthday]').val(info.dobStr);
	$('#balance').html(numberWithCommas(info.currentAmt || 0));
}

/**
 * Đổ dữ liệu vào các bảng
 * @param table
 */
function bingdingDataTable(idBodyTable,idTable,trsContent) {
	if ($.fn.dataTable.isDataTable('#' + idTable)) {
		$('#' + idTable ).dataTable().fnDestroy();
	}

	$('#' + idBodyTable).html(trsContent);

	$('#' + idTable).DataTable({
		searching: true
	});
}
/**
 * Đổ dữ liệu bảng lịch sử mua vé
 * @param data
 */
function bindingTicketHistoryTable(data) {
	var table = '';

	for (var i = 0, len = data.length; i < len; i++) {
		var item = data[i];
		table += '<tr>' +
			'<td>' + (i + 1) + ' </td>' +
			'<td>' + concatDateTime(validNullString(item.departDate).toString(), validNullString(item.startTime).toString()) + ' </td>' +
			'<td>' + validNullString(item.ticketCode) + ' </td>' +
			'<td>' + getTicketStatus(item.status) + ' </td>' +
			'<td>' + validNullString(item.custMobileNo) + " " + validNullString(item.custName) + ' </td>' +
			'<td>' + concatDateTime(validNullString(item.bookedDate).toString(), validNullString(item.bookedTime).toString()) + ' </td>' +
			'<td>' + concatDateTime(validNullString(item.cancelDate).toString(), validNullString(item.cancelDate).toString()) + ' </td>' +
			'<td>' + getPaymentType(item.paymentType) + ' </td>' +
			'<td>' + numberWithCommas(validNullString(item.paymentAmt)) + ' </td>' +
			'<td>' + validNullString(item.seatNoStr) + ' </td>' +
			'<td>' + validNullString(item.busAgencyName) + ' </td>' +
			'<td>' + validNullString(item.description) + ' </td>' +
			'</tr>'
	}
	bingdingDataTable('body-table-booking-history', 'table-booking-history', table);
}

/**
 * Đổ dữ liệu bảng lịch sử nộp tiền
 * @param data
 */
function bindingCashRequestTable(data) {
	var table = '';

	for (var i = 0, len = data.length; i < len; i++) {
		var item = data[i];
		table += '<tr>' +
			'<td>' + (i + 1) + ' </td>' +
			'<td>' + convertUnixTimeToDate(validNullString(item.regTime)) + ' </td>' +
			'<td>' + validNullString(item.code) + ' </td>' +
			'<td>' + numberWithCommas(validNullString(item.amount)) + ' </td>' +
			'<td>' + getRequestStatus(item.status) + ' </td>' +
			'<td>' + convertUnixTimeToDate(validNullString(item.updTime)) + ' </td>' +
			'</tr>'
	}
	bingdingDataTable('body-table-payment-history', 'table-payment-history', table);
}

/**
 * Đổ dữ liệu bảng lịch sử VIXECA
 * @param data
 */
function bindingTransactionHistoryTable(data) {
	var table = '';

	for (var i = 0, len = data.length; i < len; i++) {
		var item = data[i];
		table += '<tr>' +
			'<td>' + (i + 1) + ' </td>' +
			'<td>' + convertUnixTimeToDate(validNullString(item.transactionTime)) + ' </td>' +
			'<td>' + getBalanceAction(item.action) + ' </td>' +
			'<td>' + numberWithCommas(validNullString(item.totalAmt)) + ' </td>' +
			'<td>' + validNullString(item.cashRequestCode) + ' </td>' +
			'<td>' + validNullString(item.seatNoStr) + ' </td>' +
			'</tr>'
	}

	bingdingDataTable('body-table-vixeca-history', 'table-vixeca-history', table);
}


/**
 * Binding click in all document
 */
function bindingClick() {
	var userOnlineMobile;

	$('#btn-get-balance').click(function(e) {
		e.preventDefault();
		userOnlineMobile = $('input[name=phone-number]').val();
		getBalanceInfo($('input[name=phone-number]').val());
	});

	$('#btn-search-booking-history').click(function(e) {
		e.preventDefault();
		var fromDepartDate = $('input[name=from-date-booking]').val();
		var toDepartDate = $('input[name=to-date-booking]').val();
		var ticketCode = $('input[name=booking-code]').val();
		var status = $('select[name=booking-status]').val();
		getTicketInfo(userOnlineMobile, fromDepartDate, toDepartDate, ticketCode, status);
	});

	$('#btn-search-payment-history').click(function(e) {
		e.preventDefault();
		var fromTransDate = $('input[name=from-date-payment]').val();
		var toTransDate = $('input[name=to-date-payment]').val();
		var status = $('select[name=payment-status]').val();
		var requestCode = $('input[name=payment-code]').val();

		getPaymentInfo(userOnlineMobile, fromTransDate, toTransDate, status, requestCode);

	});

	$('#btn-search-vixeca-history').click(function(e) {
		e.preventDefault();
		var fromTransDate = $('input[name=from-date-xeca]').val();
		var toTransDate = $('input[name=to-date-xeca]').val();
		var action = $('select[name=xeca-action]').val();
		getTransactionInfo(userOnlineMobile, fromTransDate, toTransDate, action);

	});


}

/**
 * Gửi dữ liệu đến các API
 * @param action
 * @param data
 * @param callback
 */
function callApi(action, data, callback) {
	var options = {
		"url": xecaApiUrl + '?action=' + action,
		"method": "POST",
		"headers": {
			"content-type": "application/json",
			"cache-control": "no-cache",
		},
		"processData": false,
		"data": JSON.stringify(data)
	};
	$('.page-loader').toggle();
	$.ajax(options).done(function(data) {
		if (data && !data.errCode) {
			callback(null, data);
		}
		if (!data) {
			swal('Thông báo', 'Không tìm thấy dữ liệu!');
		} else if (data.errCode) {
			// error handle
			swal('Thông báo', 'Có lỗi xảy ra!');
		}
		$('.page-loader').toggle();
	});
}

/**
 * Lấy thông tin tài khoản
 * @param onlineUserMobile
 */
function getBalanceInfo(onlineUserMobile) {
	callApi('findXecaBalance', {onlineUserMobile}, function(err, data) {
		bindingBalanceInfo(data);
	});
}

/**
 * Lấy lịch sử mua vé
 * @param userOnlineMobile
 * @param fromDepartDate
 * @param toDepartDate
 * @param ticketCode
 * @param status
 */
function getTicketInfo(userOnlineMobile, fromDepartDate, toDepartDate, ticketCode, status) {
	var data = {
		userOnlineMobile: userOnlineMobile,
		fromTransDate: fromDepartDate,
		toTransDate: toDepartDate,
		ticketCode: ticketCode,
		status: status
	}
	callApi('findTicketHistory', data, function(err, res) {
		bindingTicketHistoryTable(res);
	});
}

/**
 * Lấy lịch sử nộp tiền
 * @param userOnlineMobile
 * @param fromTransDate
 * @param toTransDate
 * @param status
 * @param requestCode
 */
function getPaymentInfo(userOnlineMobile, fromTransDate, toTransDate, status, requestCode) {
	var data = {
		userOnlineMobile: userOnlineMobile,
		fromTransDate: fromTransDate,
		toTransDate: toTransDate,
		status: status,
		requestCode: requestCode
	}

	callApi('findCashRequest', data, function(err, res) {
		bindingCashRequestTable(res);
	});
}

/**
 * Lấy lịch sử VIXECA
 * @param userOnlineMobile
 * @param fromTransDate
 * @param toTransDate
 * @param action
 */
function getTransactionInfo(userOnlineMobile, fromTransDate, toTransDate, action) {
	var data = {
		userOnlineMobile: userOnlineMobile,
		fromTransDate: fromTransDate,
		toTransDate: toTransDate,
		action: action
	}

	callApi('findUserTransactionHistory', data, function(err, res) {
		bindingTransactionHistoryTable(res);
	});
}

$(document).ready(function() {
	init();
	bindingClick();
});

/**
 * Nối chuỗi ngày và giờ
 * @param date
 * @param time
 */
function concatDateTime(date, time) {

	var momentDate = moment(date, 'YYYYMMDD');
	if (momentDate.isValid()) {
		return momentDate.format('DD-MM-YYYY') + ' ' + time;
	}
	return date + ' ' + time;
}

/**
 * Chuyển đổi định dạng từ unixTime về dd/mm/YYYY
 * @param unixTime
 */
function convertUnixTimeToDate(unixTime) {
	return moment(unixTime).format("DD-MM-YYYY HH:mm:ss");
}

/**
 * Định dạng tiền
 * @ex 2000000 -> 2.000.000
 * @param value
 * @returns {string}
 */
function numberWithCommas(value) {
	var parts = value.toString().split(".");
	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	return parts.join(".");
}

/**
 *
 * @param ticketStatus
 * @returns {*}
 */
function getTicketStatus(ticketStatus) {
	switch (ticketStatus) {
		case 2:
			return "<label class='label label-success'>Đã thanh toán</label>";
		case 8:
			return "<label class='label label-danger'>Đã hủy</label>";
		default:
			return "";
	}
}

function getPaymentType(typePayment) {
	switch (typePayment) {
		case 3:
			return "Thanh toán trực tuyến";
		case 4:
			return "Sử dụng VIXECA";
		default:
			return "";
	}
}

function getRequestStatus(requestStatus) {
	switch (requestStatus) {
		case 1:
			return "Chờ chuyển khoản";
		case 2:
			return "Đã hủy";
		case 3:
			return "Đã duyệt";
		case 4:
			return "Đã hoàn tiền";
		default:
			return "";
	}
}

function getBalanceAction(balanceAction) {
	switch (balanceAction) {
		case 1:
			return "Nộp tiền";
		case 2:
			return "Hủy nộp tiền";
		case 3:
			return "Mua vé";
		case 4:
			return "Hoàn tiền hủy vé";
		case 5:
			return "Cắt phí hủy vé";
		default:
			return "";
	}
}

function validNullString(str) {
	if (str == null) {
		return "";
	} else {
		return str;
	}
}