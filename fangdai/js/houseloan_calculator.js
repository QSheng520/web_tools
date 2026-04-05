var businessShortRateArr6 = [5.1, 5.35, 5.6, 5.85, 6.1, 5.85, 5.6, 5.6, 5.35, 5.1, 4.85, 4.6, 3.45],
    businessShortRateArr12 = [5.56, 5.81, 6.06, 6.31, 6.56, 6.31, 6, 5.6, 5.35, 5.1, 4.85, 4.6, 3.45],
    businessShortRateArr36 = [5.6, 5.85, 6.1, 6.4, 6.65, 6.4, 6.15, 6, 5.75, 5.5, 5.25, 5, 3.45],
    businessShortRateArr60 = [5.96, 6.22, 6.45, 6.65, 6.9, 6.65, 6.4, 6, 5.75, 5.5, 5.25, 5, 4.2],
    businessLongRateArr = [6.14, 6.4, 6.6, 6.8, 7.05, 6.8, 6.55, 6.15, 5.9, 5.65, 5.4, 5.15, 4.2],
    PAFShortRateArr = [3.5, 3.75, 4, 4.2, 4.45, 4.2, 4, 3.75, 3.5, 3.25, 3, 2.75, 2.75],
    PAFLongRateArr = [4.05,
        4.3, 4.5, 4.7, 4.45, 4.7, 4.5, 4.25, 4, 3.75, 3.5, 3.25, 3.25
    ],
    loanType = 0,
    loanPeriods = 240,
    businessPeriodType = 4,
    PAFPeriodType = 1,
    businessRateType = 12,
    PAFRateType = 12,
    businessDiscount = 1,
    showResultTabID = 1,
    simpleDataTableMaxLines = 10,
    BLinkStatus = 0;
$(function() {
    $("#business_calc").on("click", function() {
        0 <= $(this).attr("class").indexOf("normal-tab") && ($(this).removeClass("normal-tab").addClass("select-tab").siblings(".tab").removeClass("select-tab").addClass("normal-tab"), $("#business_sum_line").show(), $("#business_rate_select_line").show(), $("#business_rate_value_line").show(), $("#PAF_sum_line").hide(), $("#PAF_rate_line").hide(), $("#business_interest_total_debx").hide(), $("#PAF_interest_total_debx").hide(), $("#business_interest_total_debj").hide(),
            $("#PAF_interest_total_debj").hide(), $("#business_atc_recmd_mod").show(), $("#PAF_atc_recmd_mod").hide(), $(".mix-loan-tabs").hide(), loanType = 0)
    });
    $("#PAF_calc").on("click", function() {
        0 <= $(this).attr("class").indexOf("normal-tab") && ($(this).removeClass("normal-tab").addClass("select-tab").siblings(".tab").removeClass("select-tab").addClass("normal-tab"), $("#PAF_sum_line").show(), $("#PAF_rate_line").show(), $("#business_sum_line").hide(), $("#business_rate_select_line").hide(), $("#business_rate_value_line").hide(), $("#business_interest_total_debx").hide(),
            $("#PAF_interest_total_debx").hide(), $("#business_interest_total_debj").hide(), $("#PAF_interest_total_debj").hide(), $("#PAF_atc_recmd_mod").show(), $("#business_atc_recmd_mod").hide(), $(".mix-loan-tabs").hide(), loanType = 1)
    });
    $("#mix_calc").on("click", function() {
        0 <= $(this).attr("class").indexOf("normal-tab") && ($(this).removeClass("normal-tab").addClass("select-tab").siblings(".tab").removeClass("select-tab").addClass("normal-tab"), $("#business_sum_line").show(), $("#business_rate_select_line").show(), $("#business_rate_value_line").show(),
            $("#PAF_sum_line").show(), $("#PAF_rate_line").show(), $("#business_interest_total_debx").show(), $("#PAF_interest_total_debx").show(), $("#business_interest_total_debj").show(), $("#PAF_interest_total_debj").show(), $("#business_atc_recmd_mod").show(), $("#PAF_atc_recmd_mod").hide(), $(".mix-loan-tabs").show(), loanType = 2)
    });
    $(".result-tab").on("click", function() {
        if (0 <= $(this).attr("class").indexOf("normal-tab")) {
            $(this).removeClass("normal-tab").addClass("select-tab").siblings(".result-tab").removeClass("select-tab").addClass("normal-tab");
            var a = $(this).attr("tab-id");
            $("#result_data_" + a).show().siblings(".result-data").hide();
            showResultTabID = parseInt(a)
        }
    });
    $("#loan_period_select").on("change", function() {
        var a = parseInt($(this).val());
        0 == a ? (loanPeriods = 6, PAFPeriodType = businessPeriodType = 0) : 1 == a ? (loanPeriods = 12 * a, businessPeriodType = 1, PAFPeriodType = 0) : 3 >= a ? (loanPeriods = 12 * a, businessPeriodType = 2, PAFPeriodType = 0) : 5 >= a ? (loanPeriods = 12 * a, businessPeriodType = 3, PAFPeriodType = 0) : (loanPeriods = 12 * a, businessPeriodType = 4, PAFPeriodType = 1);
        $("#loan_period_select_bar").text($(this).find("option:selected").text());
        $("#loan_period_select_bar").val($(this).val());
        "auto" == $("#business_rate_select").attr("input-method") && businessRateUpdate();
        "auto" == $("#PAF_rate_select").attr("input-method") && PAFRateUpdate()
    });
    $("#business_rate_select").on("change", function() {
        var a = $(this).val();
        businessRateType = a;
        $("#business_rate_select_bar").text($(this).find("option:selected").text());
        $("#business_rate_select_bar").val($(this).val()); - 1 == a ? ($("#business_discount_field").hide(), $("#business_rate_select_field").removeClass("long-field"),
            $("#business_rate").val(""), $(this).attr("input-method", "hand")) : 0 <= a && ("hand" == $(this).attr("input-method") && ($("#business_rate_select_field").addClass("long-field"), $("#business_discount_field").show(), $(this).attr("input-method", "auto")), businessRateUpdate())
    });
    $("#business_discount").on("change", function() {
        businessDiscount = parseFloat($(this).find("option:selected").attr("data-discount"));
        $("#business_discount_bar").text($(this).find("option:selected").text());
        $("#business_discount_bar").attr("data-discount",
            $(this).find("option:selected").attr("data-discount"));
        businessRateUpdate()
    });
    $("#PAF_rate_select").on("change", function() {
        var a = $(this).val();
        PAFRateType = a;
        $("#PAF_rate_select_bar").text($(this).find("option:selected").text());
        $("#PAF_rate_select_bar").val($(this).val()); - 1 == a ? ($("#PAF_rate").val(""), $(this).attr("input-method", "hand")) : 0 <= a && ("hand" == $(this).attr("input-method") && $(this).attr("input-method", "auto"), PAFRateUpdate())
    });
    $("#calculate").on("click", function() {
        userInputCheck() && (calculate(),
            window.scrollTo("0", "0"), $("[view=calc_input]").hide(), $("[view=calc_result]").show())
    });
    $("#recalculate").on("click", function() {
        window.scrollTo("0", "0");
        $("[view=calc_result]").hide();
        $("[view=calc_input]").show()
    });
    $(".view-more").on("click", function() {
        var a = $(this).attr("data-detail");
        $("#data_detail_" + a).show().siblings(".data-container").hide();
        window.scrollTo("0", "0");
        $("[view=calc_result]").hide();
        $("[view=data_detail]").show();
        $("#data_detail_bar").show()
    });
    $("#back_to_calc_input").on("click",
        function() {
            window.scrollTo("0", "0");
            $("[view=calc_result]").hide();
            $("[view=calc_input]").show()
        });
    $("#back_to_calc_result").on("click", function() {
        window.scrollTo("0", "0");
        $("#data_detail_bar").hide();
        $("[view=data_detail]").hide();
        $("[view=calc_result]").show()
    });
    // 跳转到提前还款计算器
    $("#go_to_early_repay").on("click", function() {
        window.scrollTo("0", "0");
        $("[view=calc_input]").hide();
        $("[view=early_repayment_calc]").show();
    });
    // 从提前还款计算器返回
    $("#back_to_main_calc").on("click", function() {
        window.scrollTo("0", "0");
        $("[view=early_repayment_calc]").hide();
        $("[view=calc_input]").show();
    });
    // 提前还款期限选择更新
    $("#early_original_period").on("change", function() {
        var periods = parseInt($(this).val());
        var years = periods / 12;
        $("#early_original_period_bar").text($(this).find("option:selected").text());
        $("#early_original_period_bar").val(periods);
    });
    // 计算提前还款
    $("#calculate_early_repay").on("click", function() {
        if (validateEarlyRepayInput()) {
            calculateEarlyRepayment();
            window.scrollTo("0", "0");
            $("#early_repay_result").show();
        }
    });
    // 组合贷明细切换
    $(".mix-loan-tabs .tab").on("click", function() {
        var tabsContainer = $(this).closest(".mix-loan-tabs");
        var view = $(this).attr("data-view");
        var container = tabsContainer.closest(".data-container");
            
        // 切换标签样式
        $(this).removeClass("normal-tab").addClass("select-tab").siblings(".tab").removeClass("select-tab").addClass("normal-tab");
            
        // 切换显示内容
        container.find(".mix-loan-view").hide();
        container.find("#mix_view_" + view + "_" + (tabsContainer.attr("id").split("_")[3])).show();
    });
    $('[ad-type="cpa"]').on("click", function() {
        window.location.href = $(this).attr("ad-url")
    });
    $('[link-type="A_Link"]').on("click", function() {
        0 == BLinkStatus && ($('[link-type="B_Link"]').each(function() {
                $(this).attr("href", $(this).attr("href2"))
            }),
            BLinkStatus = 1)
    });
    $('[link-type="B_Link"]').on("click", function() {
        0 == BLinkStatus && ($(this).addClass("clicked"), $('[link-type="B_Link"]:not(.clicked)').each(function() {
            $(this).attr("href", $(this).attr("href2"))
        }), BLinkStatus = 1)
    });
    $(".loan-search-module #FormDaikuan").submit(function(a) {
        var b = !0,
            d = !0,
            f = $.trim($('.loan-search-module input[name="loan_limit"]').val()),
            c = $.trim($('.loan-search-module input[name="loan_term"]').val()),
            g = $(".loan-search-module .warning"),
            e = "";
        0 == f.length ? (b = !1, e = "请输入贷款金额") :
            (f = parseFloat(f), 0 == f ? (b = !1, e = "贷款金额不能为0") : 700 <= f && (b = !1, e = "贷款金额太大 请核对"));
        0 == c.length ? (d = !1, e += " 请输入贷款期限") : (c = parseInt(c), 0 == c ? (d = !1, e += " 贷款期限不能为0") : 120 < c && (d = !1, e += " 贷款期限不能超过10年"));
        b && d ? (g.text(""), g.hide()) : (g.text(e), g.show(), a.preventDefault())
    })
});

function businessRateUpdate() {
    var a = 0;
    0 == businessPeriodType ? a = businessShortRateArr6[businessRateType] : 1 == businessPeriodType ? a = businessShortRateArr12[businessRateType] : 2 == businessPeriodType ? a = businessShortRateArr36[businessRateType] : 3 == businessPeriodType ? a = businessShortRateArr60[businessRateType] : 4 == businessPeriodType && (a = businessLongRateArr[businessRateType]);
    a *= businessDiscount;
    a = Math.round(100 * a) / 100;
    $("#business_rate").val("" + a)
}

function PAFRateUpdate() {
    var a = 0;
    0 == PAFPeriodType ? a = PAFShortRateArr[PAFRateType] : 1 == PAFPeriodType && (a = PAFLongRateArr[PAFRateType]);
    $("#PAF_rate").val("" + a)
}

function userInputCheck() {
    if (0 == loanType) {
        var a = businessSumInputCheck(),
            b = businessRateInputCheck();
        return a && b ? !0 : !1
    }
    if (1 == loanType) {
        var d = PAFSumInputCheck(),
            f = PAFRateInputCheck();
        return d && f ? !0 : !1
    }
    if (2 == loanType) return a = businessSumInputCheck(), b = businessRateInputCheck(), d = PAFSumInputCheck(), f = PAFRateInputCheck(), a && b && d && f ? !0 : !1
}

function businessSumInputCheck() {
    var a = $.trim($("#business_sum").val()),
        b = /^\d*[\.]?\d*$/;
    if ("" != a && b.test(a)) return !0;
    $("#business_sum").val("").focus();
    return !1
}

function businessRateInputCheck() {
    var a = $.trim($("#business_rate").val()),
        b = /^\d*[\.]?\d*$/;
    if ("" != a && b.test(a)) return !0;
    $("#business_rate").val("").focus();
    return !1
}

function PAFSumInputCheck() {
    var a = $.trim($("#PAF_sum").val()),
        b = /^\d*[\.]?\d*$/;
    if ("" != a && b.test(a)) return !0;
    $("#PAF_sum").val("").focus();
    return !1
}

function PAFRateInputCheck() {
    var a = $.trim($("#PAF_rate").val()),
        b = /^\d*[\.]?\d*$/;
    if ("" != a && b.test(a)) return !0;
    $("#PAF_rate").val("").focus();
    return !1
}

function calculate() {
    calculate_debx();
    calculate_debj();
    var a = $('input[name="repayType"]:checked').val();
    $("#result_tab_" + a).removeClass("normal-tab").addClass("select-tab").siblings(".result-tab").removeClass("select-tab").addClass("normal-tab");
    $("#result_data_" + a).show().siblings(".result-data").hide();
    showResultTabID = a
}

function calculate_debx() {
    if (0 == loanType) var a = 1E4 * parseFloat($.trim($("#business_sum").val())),
        b = parseFloat($.trim($("#business_rate").val())) / 1200,
        a = calculate_debx_singleLoan(a, b);
    else if (1 == loanType) a = 1E4 * parseFloat($.trim($("#PAF_sum").val())), b = parseFloat($.trim($("#PAF_rate").val())) / 1200, a = calculate_debx_singleLoan(a, b);
    else if (2 == loanType) var a = 1E4 * parseFloat($.trim($("#business_sum").val())),
        b = parseFloat($.trim($("#business_rate").val())) / 1200,
        d = 1E4 * parseFloat($.trim($("#PAF_sum").val())),
        f = parseFloat($.trim($("#PAF_rate").val())) / 1200,
        a = calculate_debx_doubleLoan(a, b, d, f);
    return a
}

function calculate_debx_singleLoan(a, b) {
    var d, f, c, g, e, j = a * loanPeriods * b * Math.pow(1 + b, loanPeriods) / (Math.pow(1 + b, loanPeriods) - 1) - a,
        j = Math.round(100 * j) / 100;
    d = Math.round(100 * (j + a)) / 100;
    $("#interest_total_1").text(j + "元");
    $("#repay_total_1").text("" + d + "元");
    f = d / loanPeriods;
    f = Math.round(100 * f) / 100;
    var m = 0,
        h = "",
        i = "";
    for (d = 1; d <= loanPeriods; d++) c = a * b * (Math.pow(1 + b, loanPeriods) - Math.pow(1 + b, d - 1)) / (Math.pow(1 + b, loanPeriods) - 1), c = Math.round(100 * c) / 100, g = f - c, g = Math.round(100 * g) / 100, e = a * (Math.pow(1 + b, loanPeriods) -
        Math.pow(1 + b, d)) / (Math.pow(1 + b, loanPeriods) - 1), e = Math.round(100 * e) / 100, h += "<tr>", h = h + "<td>" + d + "</td>", h = h + "<td>" + f + "</td>", h = h + "<td>" + c + "</td>", h = h + "<td>" + g + "</td>", h = h + "<td>" + e + "</td>", h += "</tr>", 1 == d && (m = c), d == simpleDataTableMaxLines && (i = h);
    $("#standard_data_table_1").html("" + h);
    "" == i && (i = h);
    $("#simple_data_table_1").html("" + i);
    $("#repay_monthly_1").text(f + "元");
    $("#interest_monthly_1").text(m + "元");
    return j
}

function calculate_debx_doubleLoan(a, b, d, f) {
    var c, g, e, j, m;
    c = a * loanPeriods * b * Math.pow(1 + b, loanPeriods) / (Math.pow(1 + b, loanPeriods) - 1) - a;
    c = Math.round(100 * c) / 100;
    e = c + a;
    g = d * loanPeriods * f * Math.pow(1 + f, loanPeriods) / (Math.pow(1 + f, loanPeriods) - 1) - d;
    g = Math.round(100 * g) / 100;
    j = g + d;
    var h;
    h = Math.round(100 * (c + g)) / 100;
    e = Math.round(100 * (e + j)) / 100;
    $("#business_interest_total_1").text(c + "元");
    $("#PAF_interest_total_1").text(g + "元");
    $("#interest_total_1").text(h + "元");
    $("#repay_total_1").text(e + "元");
    g = e / loanPeriods;
    g = Math.round(100 *
        g) / 100;
    
    // 计算商贷和公积金各自的月供
    var businessMonthlyPayment = a * b * Math.pow(1 + b, loanPeriods) / (Math.pow(1 + b, loanPeriods) - 1);
    businessMonthlyPayment = Math.round(100 * businessMonthlyPayment) / 100;
    var PAFMonthlyPayment = d * f * Math.pow(1 + f, loanPeriods) / (Math.pow(1 + f, loanPeriods) - 1);
    PAFMonthlyPayment = Math.round(100 * PAFMonthlyPayment) / 100;
    
    var i = 0,
        k = "",
        l = "",
        businessTable = "",
        pafTable = "";
    for (c = 1; c <= loanPeriods; c++) {
        // 商贷部分
        var businessInterest = a * b * (Math.pow(1 + b, loanPeriods) - Math.pow(1 + b, c - 1)) / (Math.pow(1 + b, loanPeriods) - 1);
        businessInterest = Math.round(100 * businessInterest) / 100;
        var businessPrincipal = businessMonthlyPayment - businessInterest;
        businessPrincipal = Math.round(100 * businessPrincipal) / 100;
        
        // 公积金部分
        var PAFInterest = d * f * (Math.pow(1 + f, loanPeriods) - Math.pow(1 + f, c - 1)) / (Math.pow(1 + f, loanPeriods) - 1);
        PAFInterest = Math.round(100 * PAFInterest) / 100;
        var PAFPrincipal = PAFMonthlyPayment - PAFInterest;
        PAFPrincipal = Math.round(100 * PAFPrincipal) / 100;
        
        // 总计
        e = businessInterest + PAFInterest;
        e = Math.round(100 * e) / 100;
        j = g - e;
        j = Math.round(100 * j) / 100;
        m = a * (Math.pow(1 + b, loanPeriods) - Math.pow(1 + b, c)) / (Math.pow(1 + b, loanPeriods) - 1);
        m += d * (Math.pow(1 + f, loanPeriods) - Math.pow(1 + f, c)) / (Math.pow(1 + f, loanPeriods) - 1);
        m = Math.round(100 * m) / 100;
        
        // 总计表格
        k += "<tr>";
        k = k + "<td>" + c + "</td>";
        k = k + "<td>" + g + "</td>";
        k = k + "<td>" + e + "</td>";
        k = k + "<td>" + j + "</td>";
        k = k + "<td>" + m + "</td>";
        k += "</tr>";
        
        // 商贷表格
        businessTable += "<tr>";
        businessTable = businessTable + "<td>" + c + "</td>";
        businessTable = businessTable + "<td>" + businessMonthlyPayment + "</td>";
        businessTable = businessTable + "<td>" + businessInterest + "</td>";
        businessTable = businessTable + "<td>" + businessPrincipal + "</td>";
        businessTable += "</tr>";
        
        // 公积金表格
        pafTable += "<tr>";
        pafTable = pafTable + "<td>" + c + "</td>";
        pafTable = pafTable + "<td>" + PAFMonthlyPayment + "</td>";
        pafTable = pafTable + "<td>" + PAFInterest + "</td>";
        pafTable = pafTable + "<td>" + PAFPrincipal + "</td>";
        pafTable += "</tr>";
        
        1 == c && (i = e), c == simpleDataTableMaxLines && (l = k);
    }
    $("#standard_data_table_1").html("" + k);
    $("#business_data_table_1").html("" + businessTable);
    $("#paf_data_table_1").html("" + pafTable);
    "" == l && (l = k);
    $("#simple_data_table_1").html("" + l);
    $("#repay_monthly_1").text(g + "元");
    $("#interest_monthly_1").text(i + "元");
    return h
}

function calculate_debj() {
    if (0 == loanType) var a = 1E4 * parseFloat($.trim($("#business_sum").val())),
        b = parseFloat($.trim($("#business_rate").val())) / 1200,
        a = calculate_debj_singleLoan(a, b);
    else if (1 == loanType) a = 1E4 * parseFloat($.trim($("#PAF_sum").val())), b = parseFloat($.trim($("#PAF_rate").val())) / 1200, a = calculate_debj_singleLoan(a, b);
    else if (2 == loanType) var a = 1E4 * parseFloat($.trim($("#business_sum").val())),
        b = parseFloat($.trim($("#business_rate").val())) / 1200,
        d = 1E4 * parseFloat($.trim($("#PAF_sum").val())),
        f = parseFloat($.trim($("#PAF_rate").val())) / 1200,
        a = calculate_debj_doubleLoan(a, b, d, f);
    return a
}

function calculate_debj_singleLoan(a, b) {
    var d, f, c, g, e, j = a * b * (loanPeriods + 1) / 2,
        j = Math.round(100 * j) / 100;
    d = Math.round(100 * (j + a)) / 100;
    $("#interest_total_2").text("" + j + "元");
    $("#repay_total_2").text("" + d + "元");
    g = a / loanPeriods;
    g = Math.round(100 * g) / 100;
    var m = 0,
        h = 0,
        i = "",
        k = "";
    for (d = 1; d <= loanPeriods; d++) c = a * b * (loanPeriods - d + 1) / loanPeriods, c = Math.round(100 * c) / 100, f = c + g, f = Math.round(100 * f) / 100, e = a * (loanPeriods - d) / loanPeriods, e = Math.round(100 * e) / 100, i += "<tr>", i = i + "<td>" + d + "</td>", i = i + "<td>" + f + "</td>", i = i + "<td>" +
        c + "</td>", i = i + "<td>" + g + "</td>", i = i + "<td>" + e + "</td>", i += "</tr>", 1 == d && (m = f, h = c), d == simpleDataTableMaxLines && (k = i);
    $("#standard_data_table_2").html("" + i);
    "" == k && (k = i);
    $("#simple_data_table_2").html("" + k);
    $("#repay_monthly_2").text(m + "元");
    $("#interest_monthly_2").text(h + "元");
    return j
}

function calculate_debj_doubleLoan(a, b, d, f) {
    var c, g, e, j, m;
    c = a * b * (loanPeriods + 1) / 2;
    c = Math.round(100 * c) / 100;
    e = c + a;
    g = d * f * (loanPeriods + 1) / 2;
    g = Math.round(100 * g) / 100;
    j = g + d;
    var h;
    h = Math.round(100 * (c + g)) / 100;
    e = Math.round(100 * (e + j)) / 100;
    $("#business_interest_total_2").text(c + "元");
    $("#PAF_interest_total_2").text(g + "元");
    $("#interest_total_2").text(h + "元");
    $("#repay_total_2").text(e + "元");
    
    // 计算商贷和公积金各自的每月本金
    var businessMonthlyPrincipal = a / loanPeriods;
    businessMonthlyPrincipal = Math.round(100 * businessMonthlyPrincipal) / 100;
    var PAFMonthlyPrincipal = d / loanPeriods;
    PAFMonthlyPrincipal = Math.round(100 * PAFMonthlyPrincipal) / 100;
    var totalMonthlyPrincipal = businessMonthlyPrincipal + PAFMonthlyPrincipal;
    totalMonthlyPrincipal = Math.round(100 * totalMonthlyPrincipal) / 100;
    
    j = (a + d) / loanPeriods;
    j = Math.round(100 * j) / 100;
    var i = 0,
        k = 0,
        l = "",
        n = "",
        businessTable = "",
        pafTable = "";
    for (c = 1; c <= loanPeriods; c++) {
        // 商贷部分
        var businessInterest = a * b * (loanPeriods - c + 1) / loanPeriods;
        businessInterest = Math.round(100 * businessInterest) / 100;
        var businessMonthlyPayment = businessInterest + businessMonthlyPrincipal;
        businessMonthlyPayment = Math.round(100 * businessMonthlyPayment) / 100;
        
        // 公积金部分
        var PAFInterest = d * f * (loanPeriods - c + 1) / loanPeriods;
        PAFInterest = Math.round(100 * PAFInterest) / 100;
        var PAFMonthlyPayment = PAFInterest + PAFMonthlyPrincipal;
        PAFMonthlyPayment = Math.round(100 * PAFMonthlyPayment) / 100;
        
        // 总计
        e = businessInterest + PAFInterest;
        e = Math.round(100 * e) / 100;
        g = e + j;
        g = Math.round(100 * g) / 100;
        m = a * (loanPeriods - c) / loanPeriods;
        m += d * (loanPeriods - c) / loanPeriods;
        m = Math.round(100 * m) / 100;
        
        // 总计表格
        l += "<tr>";
        l = l + "<td>" + c + "</td>";
        l = l + "<td>" + g + "</td>";
        l = l + "<td>" + e + "</td>";
        l = l + "<td>" + j + "</td>";
        l = l + "<td>" + m + "</td>";
        l += "</tr>";
        
        // 商贷表格
        businessTable += "<tr>";
        businessTable = businessTable + "<td>" + c + "</td>";
        businessTable = businessTable + "<td>" + businessMonthlyPayment + "</td>";
        businessTable = businessTable + "<td>" + businessInterest + "</td>";
        businessTable = businessTable + "<td>" + businessMonthlyPrincipal + "</td>";
        businessTable += "</tr>";
        
        // 公积金表格
        pafTable += "<tr>";
        pafTable = pafTable + "<td>" + c + "</td>";
        pafTable = pafTable + "<td>" + PAFMonthlyPayment + "</td>";
        pafTable = pafTable + "<td>" + PAFInterest + "</td>";
        pafTable = pafTable + "<td>" + PAFMonthlyPrincipal + "</td>";
        pafTable += "</tr>";
        
        1 == c && (i = g, k = e), c == simpleDataTableMaxLines && (n = l);
    }
    $("#standard_data_table_2").html("" + l);
    $("#business_data_table_2").html("" + businessTable);
    $("#paf_data_table_2").html("" + pafTable);
    "" == n && (n = l);
    $("#simple_data_table_2").html("" + n);
    $("#repay_monthly_2").text(i + "元");
    $("#interest_monthly_2").text(k +
        "元");
    return h
};

// 提前还款计算器相关函数
function validateEarlyRepayInput() {
    var loanAmount = $.trim($("#early_loan_amount").val());
    var interestRate = $.trim($("#early_interest_rate").val());
    var paidPeriods = $.trim($("#early_paid_periods").val());
    var repayAmount = $.trim($("#early_repay_amount").val());
    var pattern = /^\d*[\.]?\d*$/;
    
    if (!loanAmount || !pattern.test(loanAmount) || parseFloat(loanAmount) <= 0) {
        alert("请输入有效的贷款总额");
        $("#early_loan_amount").focus();
        return false;
    }
    if (!interestRate || !pattern.test(interestRate) || parseFloat(interestRate) <= 0) {
        alert("请输入有效的年利率");
        $("#early_interest_rate").focus();
        return false;
    }
    if (!paidPeriods || !/^\d+$/.test(paidPeriods) || parseInt(paidPeriods) <= 0) {
        alert("请输入有效的已还期数");
        $("#early_paid_periods").focus();
        return false;
    }
    if (!repayAmount || !pattern.test(repayAmount) || parseFloat(repayAmount) <= 0) {
        alert("请输入有效的提前还款金额");
        $("#early_repay_amount").focus();
        return false;
    }
    
    var totalPeriods = parseInt($("#early_original_period").val());
    if (parseInt(paidPeriods) >= totalPeriods) {
        alert("已还期数不能大于或等于总期数");
        $("#early_paid_periods").focus();
        return false;
    }
    
    var remainingPrincipal = calculateRemainingPrincipal(
        parseFloat(loanAmount) * 10000,
        parseFloat(interestRate) / 1200,
        totalPeriods,
        parseInt(paidPeriods),
        $('input[name="earlyRepayType"]:checked').val()
    );
    
    if (parseFloat(repayAmount) * 10000 >= remainingPrincipal) {
        alert("提前还款金额不能大于或等于剩余本金");
        $("#early_repay_amount").focus();
        return false;
    }
    
    return true;
}

function calculateRemainingPrincipal(principal, monthlyRate, totalPeriods, paidPeriods, repayType) {
    if (repayType == "1") {
        // 等额本息
        var monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, totalPeriods) / 
                            (Math.pow(1 + monthlyRate, totalPeriods) - 1);
        var remainingPrincipal = principal * (Math.pow(1 + monthlyRate, totalPeriods) - 
                                             Math.pow(1 + monthlyRate, paidPeriods)) / 
                                (Math.pow(1 + monthlyRate, totalPeriods) - 1);
        return Math.round(100 * remainingPrincipal) / 100;
    } else {
        // 等额本金
        var monthlyPrincipal = principal / totalPeriods;
        var remainingPrincipal = principal - monthlyPrincipal * paidPeriods;
        return Math.round(100 * remainingPrincipal) / 100;
    }
}

function calculateEarlyRepayment() {
    var loanAmount = parseFloat($("#early_loan_amount").val()) * 10000; // 转换为元
    var annualRate = parseFloat($("#early_interest_rate").val());
    var monthlyRate = annualRate / 1200;
    var totalPeriods = parseInt($("#early_original_period").val());
    var paidPeriods = parseInt($("#early_paid_periods").val());
    var earlyRepayAmount = parseFloat($("#early_repay_amount").val()) * 10000; // 转换为元
    var repayType = $('input[name="earlyRepayType"]:checked').val();
    var repayMethod = $('input[name="earlyRepayMethod"]:checked').val();
    
    // 计算原计划总利息
    var originalTotalInterest = calculateOriginalTotalInterest(loanAmount, monthlyRate, totalPeriods, repayType);
    
    // 计算剩余本金
    var remainingPrincipal = calculateRemainingPrincipal(loanAmount, monthlyRate, totalPeriods, paidPeriods, repayType);
    
    // 提前还款后的新本金
    var newPrincipal = remainingPrincipal - earlyRepayAmount;
    
    // 计算提前还款后已还的利息（前paidPeriods期的利息）
    var paidInterest = calculatePaidInterest(loanAmount, monthlyRate, totalPeriods, paidPeriods, repayType);
    
    var newTotalInterest, newMonthlyPayment, newPeriods;
    
    if (repayMethod == "shorten") {
        // 缩短期限：保持月供不变，减少期数
        if (repayType == "1") {
            // 等额本息
            var originalMonthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPeriods) / 
                                        (Math.pow(1 + monthlyRate, totalPeriods) - 1);
            
            // 计算新的期数
            newPeriods = Math.log(originalMonthlyPayment / (originalMonthlyPayment - newPrincipal * monthlyRate)) / 
                        Math.log(1 + monthlyRate);
            newPeriods = Math.ceil(newPeriods);
            
            // 计算新的总利息
            var remainingInterest = originalMonthlyPayment * newPeriods - newPrincipal;
            newTotalInterest = paidInterest + remainingInterest;
            newMonthlyPayment = originalMonthlyPayment;
        } else {
            // 等额本金
            var originalMonthlyPrincipal = loanAmount / totalPeriods;
            // 保持每月本金不变，计算新的期数
            newPeriods = Math.ceil(newPrincipal / originalMonthlyPrincipal);
            
            // 计算新的总利息
            var remainingInterest = newPrincipal * monthlyRate * (newPeriods + 1) / 2;
            newTotalInterest = paidInterest + remainingInterest;
            
            // 新月供（第一期）
            newMonthlyPayment = originalMonthlyPrincipal + newPrincipal * monthlyRate;
        }
    } else {
        // 减少月供：保持期数不变，减少月供
        var remainingPeriods = totalPeriods - paidPeriods;
        newPeriods = remainingPeriods;
        
        if (repayType == "1") {
            // 等额本息
            newMonthlyPayment = newPrincipal * monthlyRate * Math.pow(1 + monthlyRate, remainingPeriods) / 
                               (Math.pow(1 + monthlyRate, remainingPeriods) - 1);
            var remainingInterest = newMonthlyPayment * remainingPeriods - newPrincipal;
            newTotalInterest = paidInterest + remainingInterest;
        } else {
            // 等额本金
            var newMonthlyPrincipal = newPrincipal / remainingPeriods;
            // 第一个月的月供
            newMonthlyPayment = newMonthlyPrincipal + newPrincipal * monthlyRate;
            var remainingInterest = newPrincipal * monthlyRate * (remainingPeriods + 1) / 2;
            newTotalInterest = paidInterest + remainingInterest;
        }
    }
    
    // 格式化显示结果
    originalTotalInterest = Math.round(100 * originalTotalInterest) / 100;
    newTotalInterest = Math.round(100 * newTotalInterest) / 100;
    var savedInterest = originalTotalInterest - newTotalInterest;
    savedInterest = Math.round(100 * savedInterest) / 100;
    
    $("#original_total_interest").text(originalTotalInterest.toFixed(2) + "元");
    $("#new_total_interest").text(newTotalInterest.toFixed(2) + "元");
    $("#saved_interest").text(savedInterest.toFixed(2) + "元");
    
    // 原计划月供
    var originalMonthlyPayment;
    if (repayType == "1") {
        originalMonthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalPeriods) / 
                                (Math.pow(1 + monthlyRate, totalPeriods) - 1);
    } else {
        originalMonthlyPayment = loanAmount / totalPeriods + loanAmount * monthlyRate;
    }
    originalMonthlyPayment = Math.round(100 * originalMonthlyPayment) / 100;
    
    $("#original_monthly_payment").text(originalMonthlyPayment.toFixed(2) + "元");
    $("#new_monthly_payment").text(Math.round(100 * newMonthlyPayment) / 100 + "元");
    
    $("#original_periods").text(totalPeriods + "期（" + (totalPeriods / 12).toFixed(1) + "年）");
    $("#new_periods").text(newPeriods + "期（" + (newPeriods / 12).toFixed(1) + "年）");
    
    var shortenedPeriods = totalPeriods - paidPeriods - newPeriods;
    if (shortenedPeriods > 0) {
        $("#shortened_time").text(shortenedPeriods + "期（" + (shortenedPeriods / 12).toFixed(1) + "年）");
    } else {
        $("#shortened_time").text("0期（期限不变）");
    }
}

function calculateOriginalTotalInterest(principal, monthlyRate, totalPeriods, repayType) {
    if (repayType == "1") {
        // 等额本息
        var totalPayment = principal * totalPeriods * monthlyRate * Math.pow(1 + monthlyRate, totalPeriods) / 
                          (Math.pow(1 + monthlyRate, totalPeriods) - 1);
        var totalInterest = totalPayment - principal;
        return totalInterest;
    } else {
        // 等额本金
        var totalInterest = principal * monthlyRate * (totalPeriods + 1) / 2;
        return totalInterest;
    }
}

function calculatePaidInterest(principal, monthlyRate, totalPeriods, paidPeriods, repayType) {
    var paidInterest = 0;
    if (repayType == "1") {
        // 等额本息
        var monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, totalPeriods) / 
                            (Math.pow(1 + monthlyRate, totalPeriods) - 1);
        for (var i = 1; i <= paidPeriods; i++) {
            var interest = principal * monthlyRate * (Math.pow(1 + monthlyRate, totalPeriods) - 
                         Math.pow(1 + monthlyRate, i - 1)) / 
                         (Math.pow(1 + monthlyRate, totalPeriods) - 1);
            paidInterest += interest;
        }
    } else {
        // 等额本金
        var monthlyPrincipal = principal / totalPeriods;
        for (var i = 1; i <= paidPeriods; i++) {
            var interest = principal * monthlyRate * (totalPeriods - i + 1) / totalPeriods;
            paidInterest += interest;
        }
    }
    return paidInterest;
}