using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FrotiX
    {
    namespace Validations
        {
        // Server Side Validations for input fields :

        #region 1. Validate Any String Seprated by Commas (Without Case sensitivity)

        public class ValidateStrings : ValidationAttribute
            {
            private readonly string validStrings;

            public ValidateStrings(string validStrings)
                {
                this.validStrings = validStrings;
                }
            public override bool IsValid(object value)
                {
                // set result initially to false.
                bool result = false;

                // this is the value of input entered by user
                if (value != null)
                    {
                    //if user entered value, than split the valid strings and put tham in to array for comparision
                    string[] validItems = validStrings.Split(",");

                    // iterate each value for valid string check 
                    foreach (var item in validItems)
                        {
                        // converting all string to lower case for match comparision
                        if (value.ToString().ToLower() == item.ToLower())
                            {
                            // if match found than set result to true
                            result = true;
                            }
                        }
                    // return result
                    return result; ;

                    }
                else
                    {
                    //if user doesn't enter any text in the input field

                    //if user just pass an empty string as a valid string
                    if (string.IsNullOrWhiteSpace(validStrings))
                        {
                        // users supplied an empty string in validStrings and also not entered any value in input 
                        return true;
                        }


                    string[] validItems = validStrings.Split(",");
                    foreach (var item in validItems)
                        {
                        //if user spplied an empty string at the last item in validStrings 
                        // than input field can be left empty by user so result can be true.
                        if ("" == item)
                            {
                            result = true;
                            }
                        }

                    //if user has defined validStrings and none of the valid string match 
                    // (as user doesn't entered any value) than
                    //validation should be false as it requires any one input from the defined strings.
                    return result;
                    }

                }
            }

        #endregion

        #region 2. Validate Any String Seprated by Commas (With Case sensitivity)

        public class ValidateStringsWithSensitivity : ValidationAttribute
            {
            private readonly string validStrings;

            public ValidateStringsWithSensitivity(string validStrings)
                {
                this.validStrings = validStrings;
                }
            public override bool IsValid(object value)
                {
                // set result initially to false.
                bool result = false;

                // this is the value of input entered by user
                if (value != null)
                    {

                    //if user entered value , than split the valid strings and put them in to array for comparision
                    string[] validItems = validStrings.Split(",");

                    // iterate each value for valid string check 
                    foreach (var item in validItems)
                        {
                        if (value.ToString() == item)
                            {
                            // if match found than set result to true
                            result = true;
                            }
                        }
                    // return result
                    return result; ;

                    }
                else
                    {
                    //if user doesn't enter any text in the input field

                    //if user just pass an empty string as a valid string
                    if (string.IsNullOrWhiteSpace(validStrings))
                        {
                        // users supplied an empty string in validStrings and also not entered any value in input field
                        return true;
                        }


                    string[] validItems = validStrings.Split(",");
                    foreach (var item in validItems)
                        {
                        //if user spplied an empty string as the last item in validStrings 
                        // than input field can be left empty by user so result can be true.
                        if ("" == item)
                            {
                            result = true;
                            }
                        }

                    //if user has defined validStrings and none of the valid string match 
                    // (as user doesn't entered any value) than
                    //validation should be false as it requires any one input from the defined strings.
                    return result;
                    }

                }
            }

        #endregion

        #region 3. Allow only Urls

        public class OnlyUrls : ValidationAttribute
            {
            public override bool IsValid(object value)
                {
                if (value != null)
                    {
                    //checking value entered by user is a valid url or not using regex

                    Uri uriResult; // this is used as the output parameter to hold the result of below exprssion

                    bool result = Uri.TryCreate(value.ToString(), UriKind.Absolute, out uriResult)
                        && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);

                    return result;

                    }
                else
                    return true;
                }
            }

        #endregion

        #region 4. Allow Only Digits 

        public class OnlyDigits : ValidationAttribute
            {
            public override bool IsValid(object value)
                {
                if (value != null)
                    {
                    // using RegEx for matching digits i.e 0-9 in any combination
                    bool result = Regex.IsMatch(value.ToString(), "^[0-9]+$");
                    return result;
                    }
                else
                    return true;
                }
            }

        #endregion

        #region 5. Only Allow Characters 

        public class OnlyCharacters : ValidationAttribute
            {
            public override bool IsValid(object value)
                {
                if (value != null)
                    {
                    // using RegEx for matching characters only i.e a-z & A-z
                    bool result = Regex.IsMatch(value.ToString(), "^[a-zA-Z]+$");
                    return result;
                    }
                else
                    return true;
                }
            }

        #endregion

        #region 6. String is In Uppercase, in case of Characters 

        public class UpperCase : ValidationAttribute
            {
            public override bool IsValid(object value)
                {
                if (value != null)
                    {
                    // using RegEx for matching Upercase characters 
                    bool result = Regex.IsMatch(value.ToString(), "^[A-Z]+$");
                    return result;
                    }
                else
                    return true;
                }
            }

        #endregion

        #region 7. String is In Lowercase, in case of Characters 

        public class LowerCase : ValidationAttribute
            {
            public override bool IsValid(object value)
                {
                if (value != null)
                    {
                    // using RegEx for matching Lowercase characters 
                    bool result = Regex.IsMatch(value.ToString(), "^[a-z]+$");
                    return result;
                    }
                else
                    return true;
                }
            }

        #endregion

        #region 8. Validate Date With Format  

        public class ValidateDate : ValidationAttribute
            {
            private readonly string dateFormat;

            public ValidateDate(string dateFormat)
                {
                this.dateFormat = dateFormat;
                }
            public override bool IsValid(object value)
                {
                bool result;

                // For valid date formats please see below web pages
                //https://www.c-sharpcorner.com/blogs/date-and-time-format-in-c-sharp-programming1
                // https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings

                if (value != null)
                    {
                    try
                        {
                        // The dt is used to hold the converted date if conversion is successful
                        DateTime dt;
                        //if conversion of date is successful than result will have value true
                        result = DateTime.TryParseExact(value.ToString(),
                            dateFormat,
                            System.Globalization.CultureInfo.InvariantCulture,
                            System.Globalization.DateTimeStyles.None,
                            out dt);
                        return result;
                        }
                    catch
                        {
                        return false;
                        }
                    }
                else
                    return true;
                }

            //Customizing the error message for date. 
            // If you don't want to customize the message please delete / comment the below code.

            public override string FormatErrorMessage(string name)
                {
                return String.Format("{0} must be in {1} format.", name, dateFormat);
                }

            /////////////////////
            }

        #endregion

        #region 9. Validate Date Range With Format  

        public class DateRange : ValidationAttribute
            {
            private readonly string dateFormat;
            private readonly string from;
            private readonly string to;

            public DateRange(string dateFormat, string from, string to)
                {
                this.dateFormat = dateFormat;
                this.from = from;
                this.to = to;
                }
            public override bool IsValid(object value)
                {
                bool result, resultFrm, resultTo;

                // For valid date formats please see below web pages
                //https://www.c-sharpcorner.com/blogs/date-and-time-format-in-c-sharp-programming1
                // https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings

                if (value != null)
                    {
                    try
                        {
                        // dt is used to hold the converted date if conversion is successful
                        DateTime dt;
                        //if conversion of date is successful than result will have value true
                        result = DateTime.TryParseExact(value.ToString(),
                            dateFormat,
                            System.Globalization.CultureInfo.InvariantCulture,
                            System.Globalization.DateTimeStyles.None,
                            out dt);


                        try
                            {
                            //  from parameter,this date should be converted successfully
                            DateTime FDate;
                            DateTime TDate;
                            resultFrm = DateTime.TryParseExact(from.ToString(),
                            dateFormat,
                            System.Globalization.CultureInfo.InvariantCulture,
                            System.Globalization.DateTimeStyles.None,
                            out FDate);
                            //  to parameter,this date should be converted successfully
                            resultTo = DateTime.TryParseExact(to.ToString(),
                            dateFormat,
                            System.Globalization.CultureInfo.InvariantCulture,
                            System.Globalization.DateTimeStyles.None,
                            out TDate);
                            // If all dates conversion results true
                            if (result & resultFrm & resultTo)
                                {
                                // passed date should be in the range specified by user
                                if (FDate <= dt && dt <= TDate)
                                    {
                                    result = true;
                                    }
                                else
                                    {
                                    result = false;
                                    }
                                }
                            else
                                {
                                result = false;
                                }
                            return result;
                            }
                        catch
                            {
                            return false;
                            }


                        }
                    catch
                        {
                        return false;
                        }
                    }
                else
                    return true;
                }

            //Customizing the error message for date. 
            // If you don't want to customize the message please delete / coment below code.

            public override string FormatErrorMessage(string name)
                {
                return String.Format(" {0} must be between than {1} and {2} with {3} format.", name,
                    from, to, dateFormat);
                }

            /////////////////////
            }

        #endregion

        #region 10. Should Contain Domain At End

        public class ValidateDomainAtEnd : ValidationAttribute
            {
            private readonly string domainValue;

            public ValidateDomainAtEnd(string domainValue)
                {
                this.domainValue = domainValue;
                }

            public override bool IsValid(object value)
                {
                if (value != null)
                    {
                    // counting the lenght of characters from the valid domainValue string
                    int LenghtOfDomainPart = domainValue.Length;
                    // counting the lenght of characters entered by user
                    int LenghtOfEnteredValue = value.ToString().Length;
                    // Check if users enter the domainValue in user input field or not
                    if (value.ToString().ToLower().Contains(domainValue.ToLower()))
                        {
                        // Ensure domainValue comes at the end of the string, so its sub domains, emails, etc will be valid.

                        string LastPartFromEnteredValue = value.ToString().Substring((LenghtOfEnteredValue - LenghtOfDomainPart), LenghtOfDomainPart);

                        if (LastPartFromEnteredValue.ToLower() == domainValue.ToLower())
                            {
                            return true;

                            }
                        else
                            {
                            // domainValue is not at the end
                            return false;
                            }

                        }
                    else
                        {
                        return false;

                        }
                    }
                else
                    return true;
                }

            //Customizing the error message  
            // If you don't want to customize the message please delete / coment below code.

            public override string FormatErrorMessage(string name)
                {
                return String.Format(" {0} precisa conter {1} ao final.", name,
                    domainValue);
                }

            /////////////////////
            }

        #endregion

        #region 11. Should Contain Domain Name In String

        public class ValidDomainAnyWhere : ValidationAttribute
            {
            private readonly string domainValue;

            public ValidDomainAnyWhere(string domainValue)
                {
                this.domainValue = domainValue;
                }

            public override bool IsValid(object value)
                {
                if (value != null)
                    {
                    // if the string entered contains the domainValue than it is valid
                    if (value.ToString().ToLower().Contains(domainValue.ToLower()))
                        {
                        return true;

                        }
                    else
                        {
                        return false;

                        }
                    }
                else
                    return true;
                }

            //Customizing the error message  
            // If you don't want to customize the message please delete / coment below code.

            public override string FormatErrorMessage(string name)
                {
                return String.Format(" {0} must be contain {1} .", name,
                    domainValue);
                }

            /////////////////////
            }

        #endregion

        #region 12. Allow Numbers Or Characters Or Both 

        public class NumOrChars : ValidationAttribute
            {
            public override bool IsValid(object value)
                {
                if (value != null)
                    {
                    // using RegEx for matching this criteria
                    bool result = Regex.IsMatch(value.ToString(), @"^[a-zA-Z0-9]+$");
                    return result;
                    }
                else
                    return true;
                }
            }

        #endregion

        #region 13. Decimals Up To Two Decimal Places 

        public class ValidateDecimals : ValidationAttribute
            {
            public override bool IsValid(object value)
                {
                if (value != null)
                    {
                    // using RegEx for matching decimals up to 2 places
                    bool result = Regex.IsMatch(value.ToString(), "^[0-9]*?[.][0-9][0-9]?$");
                    return result;
                    }
                else
                    return true;
                }
            }

        #endregion

        #region 14. Amount Up To Three Decimal Places 

        public class ValidateAmount : ValidationAttribute
            {
            public override bool IsValid(object value)
                {
                if (value != null)
                    {
                    // using RegEx for matching Amount up to 3 decimal places
                    bool result = Regex.IsMatch(value.ToString(), "^[0-9]*?([.][0-9][0-9]?[0-9]?)?$");
                    return result;
                    }
                else
                    return true;
                }
            }

        #endregion

        #region 15. Min Age With Date Format (Compare From Today's Date)

        public class ValidateMinAge : ValidationAttribute
            {
            private readonly string dateFormat;
            private readonly string minAge;

            public ValidateMinAge(string dateFormat, string minAge)
                {
                this.dateFormat = dateFormat;
                this.minAge = minAge;
                }
            public override bool IsValid(object value)
                {
                bool result = false;
                bool IsMinAgeTrue = false;
                // For valid date formats please see below web pages
                //https://www.c-sharpcorner.com/blogs/date-and-time-format-in-c-sharp-programming1
                // https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings

                if (value != null)
                    {
                    try
                        {
                        // The dob is used to hold the converted date if conversion is successful
                        DateTime dob;
                        //if conversion of date is successful than result will have value true
                        result = DateTime.TryParseExact(value.ToString(),
                            dateFormat,
                            System.Globalization.CultureInfo.InvariantCulture,
                            System.Globalization.DateTimeStyles.None,
                            out dob);

                        // Get the diffrence in years between today's date & entered date
                        int yearDiff = DateTime.UtcNow.Year - dob.Year;

                        // covert min date in to int for comparision
                        int minAgeInt = Convert.ToInt32(minAge);

                        // compare the difference
                        if (yearDiff > minAgeInt)
                            {
                            IsMinAgeTrue = true;
                            }
                        else if (yearDiff == minAgeInt)
                            {
                            //if year diffrence is equal to entered date, than check for months
                            int monthsDiff = DateTime.UtcNow.Month - dob.Month;

                            if (monthsDiff >= 1)
                                {
                                IsMinAgeTrue = true;
                                }
                            else if (monthsDiff == 0)
                                {
                                //if months diffrence is equal to entered date in months, than check for days
                                int daysDiff = DateTime.UtcNow.Day - dob.Day;
                                if (daysDiff >= 0)
                                    {
                                    IsMinAgeTrue = true;
                                    }
                                else
                                    {
                                    IsMinAgeTrue = false;
                                    }
                                }
                            else
                                {
                                IsMinAgeTrue = false;
                                }

                            }
                        else
                            {
                            IsMinAgeTrue = false;
                            }
                        //if date entered is in corrent format (result) & DOB is >= MinAge
                        if (result & IsMinAgeTrue)
                            {
                            return true;
                            }
                        else
                            {
                            return false;
                            }
                        }
                    catch
                        {
                        return false;
                        }
                    }
                else
                    return true;
                }

            //Customizing the error message for date. 
            // If you don't want to customize the message please delete / comment the below code.

            public override string FormatErrorMessage(string name)
                {
                return String.Format("{0} must have {1} format and Date  should have minium age of {2} years.", name, dateFormat, minAge);
                }

            /////////////////////
            }

        #endregion

        #region 16. Min Age With Date Format (Compare From Given Date)

        public class ValidateMinAgeWithGivenDate : ValidationAttribute
            {
            private readonly string dateFormat;
            private readonly string minAge;
            private readonly string givenDate;

            public ValidateMinAgeWithGivenDate(string dateFormat, string minAge, string givenDate)
                {
                this.dateFormat = dateFormat;
                this.minAge = minAge;
                this.givenDate = givenDate;
                }
            public override bool IsValid(object value)
                {
                bool result = false;
                bool resultGivenDate = false;
                bool IsMinAgeTrue = false;
                // For valid date formats please see below web pages
                //https://www.c-sharpcorner.com/blogs/date-and-time-format-in-c-sharp-programming1
                // https://docs.microsoft.com/en-us/dotnet/standard/base-types/standard-date-and-time-format-strings

                if (value != null)
                    {
                    try
                        {
                        // The dob is used to hold the converted date if conversion is successful
                        DateTime dob;
                        //if conversion of date is successful than result will have value true
                        result = DateTime.TryParseExact(value.ToString(),
                            dateFormat,
                            System.Globalization.CultureInfo.InvariantCulture,
                            System.Globalization.DateTimeStyles.None,
                            out dob);

                        // if conversion of date is successful than resultGivenDate will have value true
                        DateTime gDate;
                        resultGivenDate = DateTime.TryParseExact(givenDate.ToString(),
                            dateFormat,
                            System.Globalization.CultureInfo.InvariantCulture,
                            System.Globalization.DateTimeStyles.None,
                            out gDate);

                        // Get the diffrence in years between givenDate date & entered date
                        int yearDiff = gDate.Year - dob.Year;

                        int minAgeInt = Convert.ToInt32(minAge);

                        // compare the difference
                        if (yearDiff > minAgeInt)
                            {
                            IsMinAgeTrue = true;
                            }
                        else if (yearDiff == minAgeInt)
                            {
                            //if year diffrence is equal to entered date , than check for months
                            int monthsDiff = gDate.Month - dob.Month;

                            if (monthsDiff >= 1)
                                {
                                IsMinAgeTrue = true;
                                }
                            else if (monthsDiff == 0)
                                {
                                //if months diffrence is equal to entered date in month, than check for days
                                int daysDiff = gDate.Day - dob.Day;
                                if (daysDiff >= 0)
                                    {
                                    IsMinAgeTrue = true;
                                    }
                                else
                                    {
                                    IsMinAgeTrue = false;
                                    }
                                }
                            else
                                {
                                IsMinAgeTrue = false;
                                }

                            }
                        else
                            {
                            IsMinAgeTrue = false;
                            }
                        //if date entered is in correct format (result), givenDate date is in correct format (resultGivenDate) & DOB is >= MinAge
                        if (result & IsMinAgeTrue & resultGivenDate)
                            {
                            return true;
                            }
                        else
                            {
                            return false;
                            }
                        }
                    catch
                        {
                        return false;
                        }
                    }
                else
                    return true;
                }

            //Customizing the error message for date. 
            // If you don't want to customize the message please delete / comment the below code.

            public override string FormatErrorMessage(string name)
                {
                return String.Format("{0} must have {1} format and Date  should have minium age of {2} years.", name, dateFormat, minAge);
                }

            /////////////////////
            }

        #endregion

        #region 17. Valida Lista Vazia

        public class ValidaLista : ValidationAttribute
            {
            public override bool IsValid(object value)
                {
                if (value == null)
                    {
                    //confere se foi selecionado algo na lista
                    return false;
                    }
                else
                    {
                    if (value == "")
                        {
                        return false;
                        }
                    else
                        {
                        if (value.ToString().Contains("'--Selecione um Modelo --'"))
                            {
                            return false;
                            }
                        else
                            {
                            return true;
                            }
                        }
                    }
                }
            }

        #endregion

        #region 18. Valida Campo Zero

        public class ValidaZero : ValidationAttribute
            {
            public override bool IsValid(object value)
                {


                if (value != null)
                    {
                    if (value.ToString() == "0")
                        {
                        return false;
                        }
                    else
                        {
                        return true;
                        }
                    }
                else
                    {
                    return false;
                    }
                }
            }

        #endregion

        #region 19. Formata CNPJ / CPF

        public static class FormatCnpjCpf
            {
            /// <summary>
            /// Formatar uma string CNPJ
            /// </summary>
            /// <param name="CNPJ">string CNPJ sem formatacao</param>
            /// <returns>string CNPJ formatada</returns>
            /// <example>Recebe '99999999999999' Devolve '99.999.999/9999-99'</example>

            public static string FormatCNPJ(string CNPJ)
                {
                return Convert.ToUInt64(CNPJ).ToString(@"00\.000\.000\/0000\-00");
                }

            /// <summary>
            /// Formatar uma string CPF
            /// </summary>
            /// <param name="CPF">string CPF sem formatacao</param>
            /// <returns>string CPF formatada</returns>
            /// <example>Recebe '99999999999' Devolve '999.999.999-99'</example>

            public static string FormatCPF(string CPF)
                {
                return Convert.ToUInt64(CPF).ToString(@"000\.000\.000\-00");
                }
            /// <summary>
            /// Retira a Formatacao de uma string CNPJ/CPF
            /// </summary>
            /// <param name="Codigo">string Codigo Formatada</param>
            /// <returns>string sem formatacao</returns>
            /// <example>Recebe '99.999.999/9999-99' Devolve '99999999999999'</example>

            public static string SemFormatacao(string Codigo)
                {
                return Codigo.Replace(".", string.Empty).Replace("-", string.Empty).Replace("/", string.Empty);
                }
            }

        #endregion

        }


    }


